const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Quiz = require('./models/Quiz'); // Quiz modelini import edin

dotenv.config();

const app = express();
connectDB();

app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // Geliştirme için tüm origin'lere izin ver
        methods: ["GET", "POST"]
    }
});

const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const gameRoutes = require('./routes/gameRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/game', gameRoutes);

// Canlı oyun oturumu durumunu takip etmek için basit bir obje (gerçek projede veritabanında tutulur)
const activeGameSessions = {}; // { gameCode: { hostId, quizId, quizData: { questions, ... }, players: { socketId: { playerName, score } }, currentQuestionIndex } }

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Ev sahibi bir oyun oturumu başlattığında
    socket.on('hostGame', async (data) => { // async ekledik
        const { gameCode, quizId } = data;
        socket.join(gameCode); // Ev sahibini odaya dahil et
        console.log(`Host (${socket.id}) started hosting game ${gameCode} for quiz ${quizId}`);

        try {
            // Quiz verisini veritabanından çek
            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                socket.emit('error', 'Quiz bulunamadı.');
                return;
            }

            // Canlı oturumu takip et ve quiz verilerini de sakla
            if (!activeGameSessions[gameCode]) {
                activeGameSessions[gameCode] = {
                    hostId: socket.id, // Geçici olarak socket ID'sini host ID olarak kullanıyoruz
                    quizId: quizId,
                    quizData: quiz, // Tüm quiz objesini (sorular dahil) burada saklıyoruz
                    players: {},
                    currentQuestionIndex: -1, // Henüz soru başlamadı
                };
            }
        } catch (error) {
            console.error('Error fetching quiz data for hosting:', error);
            socket.emit('error', 'Quiz verisi çekilirken hata oluştu.');
        }
    });

    // Oyuncu bir oyuna katıldığında
    socket.on('joinGame', (data) => {
        const { gameCode, playerName, playerId } = data; // playerId, Firebase userId'si olabilir
        socket.join(gameCode); // Oyuncuyu odaya dahil et
        console.log(`${playerName} (${socket.id}) joined game ${gameCode}`);

        if (activeGameSessions[gameCode]) {
            // Oyuncuyu oturuma ekle
            activeGameSessions[gameCode].players[socket.id] = { playerName, score: 0, userId: playerId };
            // Ev sahibine ve diğer oyunculara yeni oyuncunun katıldığını bildir
            io.to(gameCode).emit('playerJoined', { playerId: socket.id, playerName: playerName, currentPlayers: Object.values(activeGameSessions[gameCode].players) });

            // Eğer quiz zaten başlamış ve bir soru aktifse, yeni katılan oyuncuya o soruyu gönder
            if (activeGameSessions[gameCode].currentQuestionIndex !== -1) {
                const currentQuiz = activeGameSessions[gameCode].quizData;
                const currentQuestion = currentQuiz.questions[activeGameSessions[gameCode].currentQuestionIndex];
                if (currentQuestion) {
                    // Sadece gerekli soru bilgilerini gönder (doğru cevabı gönderme!)
                    const questionToSend = {
                        _id: currentQuestion._id, // Soru ID'si
                        questionText: currentQuestion.questionText,
                        options: currentQuestion.options.map(opt => ({ text: opt.text })), // Sadece şık metinlerini gönder
                        multimediaUrl: currentQuestion.multimediaUrl // Eğer varsa
                    };
                    socket.emit('newQuestion', questionToSend);
                    console.log(`Sending current question to new player ${playerName} in ${gameCode}`);
                }
            }

        } else {
            console.log(`Game session ${gameCode} not found for join request from ${playerName}`);
            socket.emit('error', 'Oyun oturumu bulunamadı veya henüz başlamadı.');
        }
    });

    // Host bir sonraki soruyu gönderdiğinde
    socket.on('newQuestion', (data) => { // 'newQuestion' olay adını dinliyoruz
        const { gameCode } = data; // question objesini host'tan almıyoruz, kendimiz çekiyoruz
        if (activeGameSessions[gameCode]) {
            const currentSession = activeGameSessions[gameCode];
            currentSession.currentQuestionIndex++; // Soru indeksini artır

            // Yeni soruyu quizData'dan çek
            const nextQuestion = currentSession.quizData.questions[currentSession.currentQuestionIndex];

            if (nextQuestion) {
                // Sadece gerekli soru bilgilerini gönder (doğru cevabı gönderme!)
                const questionToSend = {
                    _id: nextQuestion._id,
                    questionText: nextQuestion.questionText,
                    options: nextQuestion.options.map(opt => ({ text: opt.text })),
                    multimediaUrl: nextQuestion.multimediaUrl
                };
                // Soruyu odadaki tüm oyunculara ve ev sahibine emit et
                io.to(gameCode).emit('newQuestion', questionToSend); // Tüm odaya gönder
                console.log(`Host sent new question in game ${gameCode}: ${questionToSend.questionText}`);
            } else {
                // Tüm sorular bitti, quizi bitir
                io.to(gameCode).emit('quizEnded', Object.values(currentSession.players).map(p => ({ playerName: p.playerName, score: p.score })));
                delete activeGameSessions[gameCode];
                console.log(`Game ${gameCode} ended due to no more questions.`);
            }
        }
    });

    // Oyuncu bir cevap gönderdiğinde
    socket.on('submitAnswer', (data) => {
        const { gameCode, questionId, playerId, selectedOptionIndex } = data;
        console.log(`Answer from ${playerId} in game ${gameCode} for question ${questionId}: option ${selectedOptionIndex}`);

        if (activeGameSessions[gameCode] && activeGameSessions[gameCode].players[socket.id]) {
            const currentSession = activeGameSessions[gameCode];
            const player = currentSession.players[socket.id];
            const currentQuiz = currentSession.quizData;
            const currentQuestion = currentQuiz.questions.find(q => q._id == questionId); // Mongoose objesi olduğu için == kullanıyoruz

            if (currentQuestion && currentQuestion.correctAnswer === selectedOptionIndex) {
                player.score += 100; // Doğru cevap için puan
                console.log(`${player.playerName} correctly answered. New score: ${player.score}`);
                // Ev sahibine doğru cevaplandığını bildir (isteğe bağlı)
                io.to(currentSession.hostId).emit('answerReceived', { playerId: socket.id, correct: true, score: player.score });
            } else {
                console.log(`${player.playerName} answered incorrectly.`);
                io.to(currentSession.hostId).emit('answerReceived', { playerId: socket.id, correct: false });
            }

            // Oyuncuya kendi skor güncellemesini gönder
            socket.emit('scoreUpdate', { score: player.score });
        }
    });

    // Host quizi bitirdiğinde
    socket.on('quizEnded', (data) => {
        const { gameCode, finalScores } = data;
        if (activeGameSessions[gameCode]) {
            io.to(gameCode).emit('quizEnded', Object.values(activeGameSessions[gameCode].players).map(p => ({ playerName: p.playerName, score: p.score }))); // Tüm odaya final skorlarını gönder
            delete activeGameSessions[gameCode]; // Oturumu hafızadan sil
            console.log(`Game ${gameCode} ended by host.`);
        }
    });

    // Oyuncu veya ev sahibi odadan ayrıldığında
    socket.on('leaveGame', (data) => {
        const { gameCode, playerId } = data;
        if (activeGameSessions[gameCode] && activeGameSessions[gameCode].players[socket.id]) {
            delete activeGameSessions[gameCode].players[socket.id];
            console.log(`${playerId} (${socket.id}) left game ${gameCode}`);
            io.to(gameCode).emit('playerLeft', { playerId: socket.id, currentPlayers: Object.values(activeGameSessions[gameCode].players) });
        }
    });

    // Bağlantı kesildiğinde
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        for (const gameCode in activeGameSessions) {
            if (activeGameSessions[gameCode].players[socket.id]) {
                delete activeGameSessions[gameCode].players[socket.id];
                io.to(gameCode).emit('playerLeft', { playerId: socket.id, currentPlayers: Object.values(activeGameSessions[gameCode].players) });
                console.log(`Player ${socket.id} removed from game ${gameCode}`);
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
