import React, { useState, useEffect } from 'react';
import MessageDisplay from '../components/MessageDisplay';
import { socket } from '../services/socketService'; // Import the Socket.io client

const QuizJoiningPage = ({ userId }) => {
    const [joinCode, setJoinCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [isInGame, setIsInGame] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answerSubmitted, setAnswerSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [hostMessage, setHostMessage] = useState(''); // Messages from the host (e.g., "Time is up!")

    useEffect(() => {
        // Listen for new questions from the host
        socket.on('newQuestion', (question) => {
            console.log('New Question Received:', question);
            setCurrentQuestion(question);
            setAnswerSubmitted(false); // Allow submitting answer for new question
            setHostMessage(''); // Clear host message
            setMessage('Yeni soru geldi!');
            setMessageType('info');
        });

        // Listen for quiz end signal
        socket.on('quizEnded', (data) => {
            console.log('Quiz Ended:', data);
            setCurrentQuestion(null);
            setIsInGame(false);
            setHostMessage('Quiz sona erdi! Final skorları görüntülenecek.');
            setMessage('Quiz sona erdi.');
            setMessageType('info');
            // Here you might display final scores or redirect to a results page
        });

        // Clean up Socket.io listeners on component unmount
        return () => {
            socket.off('newQuestion');
            socket.off('quizEnded');
        };
    }, []);


    const handleJoinGame = async () => {
        if (!joinCode.trim() || !playerName.trim()) {
            setMessage('Lütfen katılım kodu ve oyuncu adınızı girin.');
            setMessageType('error');
            return;
        }
        setMessage('');
        setMessageType('info');

        try {
            // Emit 'joinGame' event to the server via Socket.io
            socket.emit('joinGame', { gameCode: joinCode, playerName: playerName, playerId: userId });
            setIsInGame(true);
            setMessage('Oyuna başarıyla katıldınız! Soruyu bekleyin...');
            setMessageType('success');
            setScore(0); // Reset score
            setHostMessage(''); // Clear any old host messages
        } catch (error) {
            setMessage('Oyuna katılırken bir hata oluştu.');
            setMessageType('error');
            console.error('Error joining game:', error);
        }
    };

    const handleSubmitAnswer = (selectedIndex) => {
        if (answerSubmitted) return; // Prevent multiple submissions

        setMessage(`Cevabınız: Seçenek ${selectedIndex + 1}. Bekleniyor...`);
        setMessageType('info');
        setAnswerSubmitted(true);

        // Emit 'submitAnswer' event to the server via Socket.io
        socket.emit('submitAnswer', {
            gameCode: joinCode,
            questionId: currentQuestion._id, // Assuming questions have IDs in a real scenario
            playerId: userId,
            selectedOptionIndex: selectedIndex,
            timeTaken: 5000 // Dummy time taken for scoring (e.g., 5 seconds)
        });

        // In a real app, the server would send back a score update or correctness feedback
        // For now, we simulate a small score gain for demonstration.
        setTimeout(() => {
            setScore(prev => prev + 50); // Dummy score update
            setMessage('Cevabınız kaydedildi. Yeni soru bekleniyor...');
            setMessageType('success');
        }, 1000);
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6">Quiz'e Katıl</h2>

            <MessageDisplay message={message} type={messageType} />
            {hostMessage && <MessageDisplay message={hostMessage} type="info" />}

            {!isInGame ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="joinCode">
                            Katılım Kodu
                        </label>
                        <input
                            type="text"
                            id="joinCode"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-center text-lg font-bold"
                            placeholder="6 haneli kodu girin"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="playerName">
                            Oyuncu Adınız
                        </label>
                        <input
                            type="text"
                            id="playerName"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                            placeholder="Adınızı girin"
                            required
                        />
                    </div>
                    <button
                        onClick={handleJoinGame}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        Oyuna Katıl
                    </button>
                </div>
            ) : (
                <div>
                    <p className="text-xl font-bold text-purple-700 mb-4">Hoş Geldin, {playerName}!</p>
                    <p className="text-lg text-gray-600 mb-6">Puanınız: <span className="font-bold text-indigo-600 text-2xl">{score}</span></p>

                    {currentQuestion ? (
                        <div className="bg-blue-50 p-6 rounded-lg shadow-inner">
                            <p className="text-2xl font-semibold text-blue-800 mb-6">{currentQuestion.questionText}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSubmitAnswer(index)}
                                        disabled={answerSubmitted}
                                        className={`w-full py-3 px-4 rounded-lg text-lg font-semibold shadow-md transition duration-300 ease-in-out
                                            ${answerSubmitted ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 text-white transform hover:scale-105'}`}
                                    >
                                        {option.text} {/* Assuming option has a 'text' property */}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 p-6 rounded-lg shadow-inner">
                            <p className="text-xl font-bold text-yellow-800">Yeni soru bekleniyor veya quiz sona erdi.</p>
                            <p className="text-gray-600 mt-2">Lütfen sunucunun bir sonraki soruyu göndermesini bekleyin.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuizJoiningPage;
