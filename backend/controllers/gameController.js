const GameSession = require('../models/GameSession');
const Quiz = require('../models/Quiz');

// Helper to generate a unique game code
const generateUniqueGameCode = async () => {
    let code;
    let isUnique = false;
    while (!isUnique) {
        code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
        const existingSession = await GameSession.findOne({ gameCode: code });
        if (!existingSession) {
            isUnique = true;
        }
    }
    return code;
};

// @desc    Create a new game session
// @route   POST /api/game/create
// @access  Private
const createGameSession = async (req, res) => {
    const { quizId } = req.body;
    const hostId = req.user._id;

    try {
        // Ensure the quiz exists and belongs to the host
        const quiz = await Quiz.findById(quizId);
        if (!quiz || quiz.createdBy.toString() !== hostId.toString()) {
            return res.status(404).json({ message: 'Quiz not found or not authorized' });
        }

        const gameCode = await generateUniqueGameCode();

        const gameSession = await GameSession.create({
            quizId,
            hostId,
            gameCode,
            status: 'pending', // Waiting for players
            players: [],
            currentQuestionIndex: -1,
        });

        res.status(201).json(gameSession);
    } catch (error) {
        res.status(500).json({ message: 'Error creating game session', error: error.message });
    }
};

// @desc    Get a game session by its code
// @route   GET /api/game/:gameCode
// @access  Public (players need to join)
const getGameSession = async (req, res) => {
    try {
        const gameSession = await GameSession.findOne({ gameCode: req.params.gameCode }).populate('quizId'); // Populate quiz details
        if (!gameSession) {
            return res.status(404).json({ message: 'Game session not found' });
        }
        res.json(gameSession);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching game session', error: error.message });
    }
};

// @desc    Update game session status (e.g., 'active', 'finished')
// @route   PUT /api/game/:gameCode/status
// @access  Private (only host can change status)
const updateGameSessionStatus = async (req, res) => {
    const { status, currentQuestionIndex } = req.body;
    const hostId = req.user._id;

    try {
        const gameSession = await GameSession.findOne({ gameCode: req.params.gameCode });

        if (!gameSession) {
            return res.status(404).json({ message: 'Game session not found' });
        }

        // Ensure host is updating their own session
        if (gameSession.hostId.toString() !== hostId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this game session' });
        }

        gameSession.status = status || gameSession.status;
        if (currentQuestionIndex !== undefined) {
            gameSession.currentQuestionIndex = currentQuestionIndex;
        }

        const updatedSession = await gameSession.save();
        res.json(updatedSession);
    } catch (error) {
        res.status(500).json({ message: 'Error updating game session status', error: error.message });
    }
};

// Additional functions for player joining, submitting answers, updating scores would integrate with Socket.io

module.exports = { createGameSession, getGameSession, updateGameSessionStatus };
