const mongoose = require('mongoose');

const PlayerScoreSchema = mongoose.Schema({
    playerId: { type: String, required: true }, // Socket ID or User ID
    playerName: { type: String, required: true },
    score: { type: Number, default: 0 },
    answers: [{ // Store answers for quiz history
        questionIndex: { type: Number, required: true },
        submittedOptionIndex: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
        timeTaken: { type: Number } // Time in milliseconds
    }]
});

const GameSessionSchema = mongoose.Schema(
    {
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
            required: true,
        },
        hostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        gameCode: {
            type: String,
            required: true,
            unique: true,
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'finished'],
            default: 'pending',
        },
        players: [PlayerScoreSchema], // Array of player scores and info
        currentQuestionIndex: {
            type: Number,
            default: -1, // -1 means game not started, 0 is first question
        },
        // Additional fields for real-time tracking if needed
    },
    {
        timestamps: true,
    }
);

const GameSession = mongoose.model('GameSession', GameSessionSchema);

module.exports = GameSession;
