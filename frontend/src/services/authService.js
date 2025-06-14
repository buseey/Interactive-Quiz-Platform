const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/auth'; // Ensure this matches your backend

// Register a new user
export const registerUser = async (username, password) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Kayıt başarısız oldu');
    }
    return data;
};

// Login user
export const loginUser = async (username, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Giriş başarısız oldu');
    }
    return data;
};
