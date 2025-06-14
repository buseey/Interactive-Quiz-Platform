import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext'; // Import useAuth hook
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import QuizCreationPage from './pages/QuizCreationPage';
import QuizHostingPage from './pages/QuizHostingPage';
import QuizJoiningPage from './pages/QuizJoiningPage';
import Header from './components/Header'; // Import Header component

const App = () => {
    const [currentPage, setCurrentPage] = useState('home'); // State for navigation
    const { userId, db, isAuthReady, setUserId } = useAuth(); // Get auth context values

    // Display loading state until authentication is ready
    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-xl font-semibold text-gray-700">Yükleniyor...</div>
            </div>
        );
    }

    // Main navigation switch
    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage setCurrentPage={setCurrentPage} userId={userId} />;
            case 'login':
                return <AuthPage type="login" setCurrentPage={setCurrentPage} />;
            case 'register':
                return <AuthPage type="register" setCurrentPage={setCurrentPage} />;
            case 'create-quiz':
                return <QuizCreationPage userId={userId} db={db} />;
            case 'host-quiz':
                return <QuizHostingPage userId={userId} db={db} />;
            case 'join-quiz':
                return <QuizJoiningPage userId={userId} />;
            default:
                return <HomePage setCurrentPage={setCurrentPage} userId={userId} />;
        }
    };

    return (
        <div className="font-sans antialiased text-gray-800 bg-gray-100 min-h-screen flex flex-col">
            <Header setCurrentPage={setCurrentPage} userId={userId} setUserId={setUserId} />

            {/* Main content area */}
            <main className="flex-grow container mx-auto p-6 flex items-center justify-center">
                {renderPage()}
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white p-4 text-center rounded-t-lg shadow-inner">
                <p>&copy; 2025 İnteraktif Quiz Platformu. Tüm Hakları Saklıdır.</p>
            </footer>
        </div>
    );
};

export default App;
