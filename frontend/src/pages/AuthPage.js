import React, { useState } from 'react';
import MessageDisplay from '../components/MessageDisplay';
import { loginUser, registerUser } from '../services/authService'; // Import auth service functions
import { useAuth } from '../contexts/AuthContext'; // To update user ID on login

const AuthPage = ({ type, setCurrentPage }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info'); // 'success', 'error', 'info'
    const { setUserId } = useAuth(); // Get setUserId from context

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        setMessageType('info');

        try {
            if (type === 'register') {
                const data = await registerUser(username, password);
                if (data.token) {
                    setMessage('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
                    setMessageType('success');
                    setUsername('');
                    setPassword('');
                    setCurrentPage('login'); // Redirect to login after successful registration
                } else {
                    setMessage(data.message || 'Kayıt sırasında bir hata oluştu.');
                    setMessageType('error');
                }
            } else { // Login
                const data = await loginUser(username, password);
                if (data.token) {
                    localStorage.setItem('jwtToken', data.token); // Store token
                    setUserId(data._id); // Update userId in context
                    setMessage('Giriş başarılı! Ana sayfaya yönlendiriliyorsunuz...');
                    setMessageType('success');
                    setCurrentPage('home'); // Redirect to home on successful login
                } else {
                    setMessage(data.message || 'Geçersiz kullanıcı adı veya şifre.');
                    setMessageType('error');
                }
            }
        } catch (error) {
            setMessage('Sunucuya bağlanırken bir hata oluştu. Lütfen tekrar deneyin.');
            setMessageType('error');
            console.error('Auth error:', error);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
                {type === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                        Kullanıcı Adı
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                        placeholder="Kullanıcı adınızı girin"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Şifre
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                        placeholder="Şifrenizi girin"
                        required
                    />
                </div>
                <MessageDisplay message={message} type={messageType} />
                <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                >
                    {type === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                </button>
            </form>
            <div className="mt-6 text-center">
                {type === 'login' ? (
                    <p className="text-gray-600">
                        Hesabınız yok mu?{' '}
                        <button
                            onClick={() => setCurrentPage('register')}
                            className="text-purple-600 hover:text-purple-800 font-semibold transition duration-300"
                        >
                            Kayıt Olun
                        </button>
                    </p>
                ) : (
                    <p className="text-gray-600">
                        Zaten hesabınız var mı?{' '}
                        <button
                            onClick={() => setCurrentPage('login')}
                            className="text-purple-600 hover:text-purple-800 font-semibold transition duration-300"
                        >
                            Giriş Yapın
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
};

export default AuthPage;
