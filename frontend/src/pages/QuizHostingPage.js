import React, { useState, useEffect } from 'react';
import MessageDisplay from '../components/MessageDisplay';
import { getQuizzes as getQuizzesApi, createGameSession as createGameSessionApi } from '../services/quizService';
import { useAuth } from '../contexts/AuthContext';
import { socket } from '../services/socketService';

const QuizHostingPage = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [sessionCode, setSessionCode] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(-1);
    const [scores, setScores] = useState({}); // { playerId: score }
    const [players, setPlayers] = useState({}); // { socketId: playerName } for current session
    const { userId } = useAuth();

    useEffect(() => {
        if (!userId) {
            setMessage("Quizleri görüntülemek için giriş yapmalısınız.");
            setMessageType('error');
            return;
        }

        const fetchQuizzes = async () => {
            try {
                const fetchedQuizzes = await getQuizzesApi();
                setQuizzes(fetchedQuizzes);
            } catch (error) {
                setMessage("Quizler yüklenirken bir hata oluştu.");
                setMessageType('error');
                console.error("Error fetching quizzes:", error);
            }
        };

        fetchQuizzes();

        // Socket.io listeners for host
        socket.on('playerJoined', (data) => {
            console.log('Player Joined:', data);
            setPlayers(prevPlayers => ({
                ...prevPlayers,
                [data.playerId]: data.playerName
            }));
            setMessage(`${data.playerName} oyuna katıldı!`);
            setMessageType('success');
        });

        socket.on('answerReceived', (data) => {
            console.log('Answer Received:', data);
            // In a real app, you would validate the answer and update scores
            // For now, let's just log and perhaps give a dummy point.
            // This would trigger a score update.
            setScores(prevScores => ({
                ...prevScores,
                [data.playerId]: (prevScores[data.playerId] || 0) + 10 // Dummy score
            }));
            setMessage(`${players[data.playerId] || data.playerId} cevapladı.`);
        });

        // Clean up Socket.io listeners on component unmount
        return () => {
            socket.off('playerJoined');
            socket.off('answerReceived');
        };
    }, [userId, players]);

    const startQuizSession = async (quiz) => {
        if (!userId) {
            setMessage("Quiz oturumu başlatmak için giriş yapmalısınız.");
            setMessageType('error');
            return;
        }
        setMessage('');
        setMessageType('info');

        try {
            const gameSession = await createGameSessionApi(quiz._id);
            if (gameSession && gameSession.gameCode) {
                setSelectedQuiz(quiz);
                setSessionCode(gameSession.gameCode);
                setMessage(`Quiz "${quiz.title}" başladı! Katılım Kodu: ${gameSession.gameCode}`);
                setMessageType('success');
                setActiveQuestionIndex(0); // Start with the first question
                setScores({}); // Reset scores for new session
                setPlayers({}); // Reset players for new session

                // Host joins the game room
                socket.emit('hostGame', { gameCode: gameSession.gameCode, quizId: quiz._id });
                // İlk soruyu bağlantı kuran oyunculara gönder
                // 'nextQuestion' yerine 'newQuestion' emit ediyoruz
                socket.emit('newQuestion', { gameCode: gameSession.gameCode, question: quiz.questions[0] });

            } else {
                setMessage(gameSession.message || 'Oyun oturumu oluşturulurken hata oluştu.');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Oyun oturumu oluşturulurken bir hata oluştu. Sunucuya ulaşılamıyor olabilir.');
            setMessageType('error');
            console.error('Error creating game session:', error);
        }
    };

    const nextQuestion = () => {
        if (selectedQuiz && activeQuestionIndex < selectedQuiz.questions.length - 1) {
            const nextIndex = activeQuestionIndex + 1;
            setActiveQuestionIndex(nextIndex);
            setMessage(`Soru ${nextIndex + 1}`);
            setMessageType('info');
            // Yeni soruyu tüm oyunculara emit et
            // 'nextQuestion' yerine 'newQuestion' emit ediyoruz
            socket.emit('newQuestion', { gameCode: sessionCode, question: selectedQuiz.questions[nextIndex] });
        } else {
            setMessage('Quiz sona erdi! Sonuçlar gösteriliyor...');
            setMessageType('info');
            setActiveQuestionIndex(-1); // End of quiz, show final scoreboard
            socket.emit('quizEnded', { gameCode: sessionCode, finalScores: scores }); // Oyuncuları bilgilendir
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">Quizleri Yönet ve Başlat</h2>

            <MessageDisplay message={message} type={messageType} />

            {!selectedQuiz ? (
                <div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Mevcut Quizleriniz</h3>
                    {quizzes.length === 0 ? (
                        <p className="text-gray-600 text-center">Henüz oluşturulmuş quiz yok. Quiz oluşturmak için "Quiz Oluştur" sayfasına gidin.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {quizzes.map(quiz => (
                                <div key={quiz.id} className="bg-gray-50 p-4 rounded-lg shadow border border-gray-200 flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold text-purple-700">{quiz.title}</h4>
                                        <p className="text-sm text-gray-600">Soru Sayısı: {quiz.questions.length}</p>
                                    </div>
                                    <button
                                        onClick={() => startQuizSession(quiz)}
                                        className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-lg transition duration-300"
                                    >
                                        Quiz Başlat
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center">
                    <h3 className="text-3xl font-bold text-purple-700 mb-4">{selectedQuiz.title}</h3>
                    <p className="text-2xl font-semibold text-gray-800 mb-6">Oturum Kodu: <span className="text-indigo-600 text-4xl">{sessionCode}</span></p>

                    <div className="mb-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-2">Katılımcılar:</h4>
                        {Object.keys(players).length === 0 ? (
                            <p className="text-gray-600">Henüz kimse katılmadı.</p>
                        ) : (
                            <ul className="list-disc list-inside mx-auto max-w-xs text-left">
                                {Object.values(players).map((playerName, index) => (
                                    <li key={index} className="text-lg text-gray-700">{playerName}</li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {activeQuestionIndex !== -1 && selectedQuiz.questions[activeQuestionIndex] ? (
                        <div className="bg-indigo-50 p-6 rounded-lg shadow-inner mb-6">
                            <p className="text-xl font-bold text-indigo-800 mb-4">Soru {activeQuestionIndex + 1}:</p>
                            <p className="text-2xl font-semibold text-indigo-700 mb-6">{selectedQuiz.questions[activeQuestionIndex].questionText}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                {selectedQuiz.questions[activeQuestionIndex].options.map((option, index) => (
                                    <div key={index} className="bg-white p-3 rounded-md shadow-sm border border-indigo-200">
                                        <span className="font-medium text-gray-700">{option.text}</span> {/* options'ın 'text' özelliğini kullan */}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={nextQuestion}
                                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
                            >
                                Sonraki Soru
                            </button>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 p-6 rounded-lg shadow-inner mb-6">
                            <p className="text-xl font-bold text-yellow-800">Quiz tamamlandı!</p>
                            <h4 className="text-2xl font-semibold text-yellow-700 mt-4">Son Skorlar:</h4>
                            {Object.keys(scores).length === 0 ? (
                                <p className="text-gray-600 mt-2">Henüz skor yok. Oyuncular katılınca burada belirecek.</p>
                            ) : (
                                <ul className="list-disc list-inside mt-4 text-left mx-auto max-w-xs">
                                    {Object.entries(scores)
                                        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA) // Puana göre azalan sırala
                                        .map(([playerId, score]) => (
                                        <li key={playerId} className="text-lg text-gray-700">
                                            {players[playerId] || playerId}: {score} puan
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <button
                                onClick={() => setSelectedQuiz(null)}
                                className="mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
                            >
                                Başka Bir Quiz Başlat
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuizHostingPage;
