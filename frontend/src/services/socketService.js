import { io } from 'socket.io-client';

// The URL for your Socket.io server (should be your backend URL)
const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';

// Create a Socket.io client instance
export const socket = io(SOCKET_SERVER_URL);

// Listen for connection events (optional, for debugging)
socket.on('connect', () => {
    console.log('Connected to Socket.io server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from Socket.io server');
});

socket.on('connect_error', (err) => {
    console.error('Socket.io connection error:', err.message);
});

// You can add more generic event listeners here if needed
