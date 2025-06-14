const express = require('express');
const { createGameSession, getGameSession, updateGameSessionStatus } = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Protect game session creation and management
router.use(protect);

// Route to create a new game session
router.post('/create', createGameSession);

// Route to get a game session by its code
router.get('/:gameCode', getGameSession);

// Route to update game session status (e.g., start, finish)
router.put('/:gameCode/status', updateGameSessionStatus);

// Note: Most real-time game logic will be handled directly via Socket.io in server.js
// This file is primarily for initial session creation/lookup or other non-realtime game management

module.exports = router;
