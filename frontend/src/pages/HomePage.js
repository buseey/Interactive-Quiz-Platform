import React from 'react';

const HomePage = ({ setCurrentPage, userId }) => {
    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl text-center">
            <h2 className="text-4xl font-extrabold text-indigo-700 mb-6 animate-fade-in-down">
                Quiz Dünyasına Hoş Geldiniz!
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Kendi quizlerinizi oluşturun, arkadaşlarınızla canlı oturumlar düzenleyin veya mevcut quizlere katılın!
            </p>
            <div className="space-y-4 md:space-y-0 md:flex md:justify-center md:space-x-4">
                <button
                    onClick={() => setCurrentPage('create-quiz')}
                    className="w-full md:w-auto px-8 py-4 bg-purple-600 text-white font-semibold text-xl rounded-lg shadow-lg hover:bg-purple-700 transform hover:scale-105 transition duration-300 ease-in-out"
                >
                    <i className="lucide-plus mr-2"></i> Quiz Oluştur
                </button>
                <button
                    onClick={() => setCurrentPage('host-quiz')}
                    className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white font-semibold text-xl rounded-lg shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition duration-300 ease-in-out"
                >
                    <i className="lucide-monitor mr-2"></i> Quiz Yönet
                </button>
                <button
                    onClick={() => setCurrentPage('join-quiz')}
                    className="w-full md:w-auto px-8 py-4 bg-green-500 text-white font-semibold text-xl rounded-lg shadow-lg hover:bg-green-600 transform hover:scale-105 transition duration-300 ease-in-out"
                >
                    <i className="lucide-play mr-2"></i> Quiz'e Katıl
                </button>
            </div>
            {userId && (
                <div className="mt-8 text-sm text-gray-500">
                    Mevcut Kullanıcı ID: <span className="font-mono text-gray-700 break-all">{userId}</span>
                </div>
            )}
        </div>
    );
};

export default HomePage;
