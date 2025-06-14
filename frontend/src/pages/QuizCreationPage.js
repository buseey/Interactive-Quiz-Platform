import React, { useState } from 'react';
import MessageDisplay from '../components/MessageDisplay';
import { createQuiz as createQuizApi } from '../services/quizService';
import { useAuth } from '../contexts/AuthContext';

const QuizCreationPage = () => {
    const [quizTitle, setQuizTitle] = useState('');
    // Seçenekleri { text: '' } nesneleri olarak başlat, multimediaUrl ekle
    const [questions, setQuestions] = useState([{ questionText: '', options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }], correctAnswer: 0, multimediaUrl: '' }]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [isLoading, setIsLoading] = useState(false);
    const { userId } = useAuth();

    const handleQuestionTextChange = (index, text) => {
        const newQuestions = [...questions];
        newQuestions[index].questionText = text;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, text) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = { text: text };
        setQuestions(newQuestions);
    };

    const handleCorrectAnswerChange = (qIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].correctAnswer = parseInt(value);
        setQuestions(newQuestions);
    };

    const handleMultimediaUrlChange = (index, url) => {
        const newQuestions = [...questions];
        newQuestions[index].multimediaUrl = url;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        // Yeni soru eklerken de seçenekleri { text: '' } nesneleri olarak başlat, multimediaUrl ekle
        setQuestions([...questions, { questionText: '', options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }], correctAnswer: 0, multimediaUrl: '' }]);
    };

    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, qIndex) => qIndex !== index);
        setQuestions(newQuestions);
    };

    const saveQuiz = async () => {
        if (!userId) {
            setMessage('Quiz oluşturmak için giriş yapmalısınız.');
            setMessageType('error');
            return;
        }
        if (!quizTitle.trim()) {
            setMessage('Quiz başlığı boş bırakılamaz.');
            setMessageType('error');
            return;
        }
        const allOptionsFilled = questions.every(q =>
            q.questionText.trim() && q.options.every(opt => opt.text.trim())
        );
        if (!allOptionsFilled) {
            setMessage('Lütfen tüm soru ve cevap seçeneklerini doldurun.');
            setMessageType('error');
            return;
        }

        setIsLoading(true);
        setMessage('');
        setMessageType('info');

        try {
            const response = await createQuizApi({
                title: quizTitle,
                description: '',
                questions: questions,
            });

            if (response && response._id) {
                setMessage('Quiz başarıyla kaydedildi!');
                setMessageType('success');
                setQuizTitle('');
                setQuestions([{ questionText: '', options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }], correctAnswer: 0, multimediaUrl: '' }]);
            } else {
                setMessage(response.message || 'Quiz kaydedilirken bir hata oluştu.');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Quiz kaydederken hata oluştu:', error);
            setMessage('Quiz kaydedilirken bir hata oluştu. Sunucuya ulaşılamıyor olabilir.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">Yeni Quiz Oluştur</h2>
            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quizTitle">
                    Quiz Başlığı
                </label>
                <input
                    type="text"
                    id="quizTitle"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    placeholder="Quizinizin başlığını girin"
                    required
                />
            </div>

            <div className="space-y-8 mb-8">
                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">Soru {qIndex + 1}</h3>
                            {questions.length > 1 && (
                                <button
                                    onClick={() => removeQuestion(qIndex)}
                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300"
                                >
                                    <i className="lucide-x w-4 h-4"></i>
                                </button>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Soru Metni</label>
                            <input
                                type="text"
                                value={q.questionText}
                                onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                placeholder="Soruyu buraya yazın"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Multimedya URL'si (İsteğe Bağlı - Resim/Video)</label>
                            <input
                                type="url" // URL tipi input
                                value={q.multimediaUrl}
                                onChange={(e) => handleMultimediaUrlChange(qIndex, e.target.value)}
                                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                placeholder="Resim veya video URL'si (örn: https://example.com/image.jpg)"
                            />
                            {q.multimediaUrl && (
                                <p className="text-xs text-gray-500 mt-1">Örn: .jpg, .png, .gif, .mp4, .webm</p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {q.options.map((option, oIndex) => (
                                <div key={oIndex}>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Seçenek {oIndex + 1}
                                    </label>
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                        placeholder={`Seçenek ${oIndex + 1}`}
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Doğru Cevap</label>
                            <select
                                value={q.correctAnswer}
                                onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                                className="shadow border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200"
                            >
                                {q.options.map((option, oIndex) => ( // option objesi kullanılıyor
                                    <option key={oIndex} value={oIndex}>
                                        Seçenek {oIndex + 1}: {option.text}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={addQuestion}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out mb-4"
            >
                Soru Ekle
            </button>

            <MessageDisplay message={message} type={messageType} />

            <button
                onClick={saveQuiz}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                disabled={isLoading}
            >
                {isLoading ? 'Kaydediliyor...' : 'Quizi Kaydet'}
            </button>
        </div>
    );
};

export default QuizCreationPage;
