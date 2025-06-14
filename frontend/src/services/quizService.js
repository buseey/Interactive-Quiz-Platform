const API_URL = 'http://localhost:4000/api'; // Base API URL

// Helper to get authorization header
const getAuthHeader = () => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
};

// Create a new quiz
export const createQuiz = async (quizData) => {
    const response = await fetch(`${API_URL}/quizzes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(quizData),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Quiz oluşturulamadı');
    }
    return data;
};

// Get all quizzes for the authenticated user
export const getQuizzes = async () => {
    const response = await fetch(`${API_URL}/quizzes`, {
        method: 'GET',
        headers: {
            ...getAuthHeader(),
        },
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Quizler yüklenemedi');
    }
    return data;
};

// Create a new game session
export const createGameSession = async (quizId) => {
    const response = await fetch(`${API_URL}/game/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify({ quizId }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Oyun oturumu oluşturulamadı');
    }
    return data;
};

// Get a game session by code (public, no auth required)
export const getGameSessionByCode = async (gameCode) => {
    const response = await fetch(`${API_URL}/game/${gameCode}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Oyun oturumu bulunamadı');
    }
    return data;
};
