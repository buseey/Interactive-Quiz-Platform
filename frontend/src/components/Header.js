import React from 'react';

const Header = ({ setCurrentPage, userId, setUserId }) => {
    return (
        <header className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 shadow-lg rounded-b-lg">
            <nav className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white cursor-pointer" onClick={() => setCurrentPage('home')}>
                    Kahoot! Benzeri Quiz Platformu
                </h1>
                <div className="flex space-x-4">
                    {userId && <span className="text-white text-sm">Kullanıcı ID: {userId}</span>}
                    {!userId ? (
                        <>
                            <button
                                onClick={() => setCurrentPage('login')}
                                className="px-4 py-2 bg-white text-purple-600 rounded-md shadow-md hover:bg-gray-100 transition duration-300"
                            >
                                Giriş Yap
                            </button>
                            <button
                                onClick={() => setCurrentPage('register')}
                                className="px-4 py-2 bg-purple-500 text-white rounded-md shadow-md hover:bg-purple-700 transition duration-300"
                            >
                                Kayıt Ol
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                alert('Çıkış yapıldı. (Gerçek logout entegre edilecek)');
                                setUserId(null); // Clear userId state
                                setCurrentPage('home');
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 transition duration-300"
                        >
                            Çıkış Yap
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;
