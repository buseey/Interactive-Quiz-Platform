const mongoose = require('mongoose');

const OptionSchema = mongoose.Schema({
    text: { type: String, required: true },
});

const QuestionSchema = mongoose.Schema({
    questionText: { type: String, required: true },
    options: [OptionSchema], // Array of option objects
    correctAnswer: { type: Number, required: true }, // Index of the correct option (0-indexed)
    multimediaUrl: { type: String } // Yeni eklendi: Resim veya video URL'si
});

const QuizSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        questions: [QuestionSchema], // Array of question objects
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, // Link to User model
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt timestamps
    }
);

const Quiz = mongoose.model('Quiz', QuizSchema);

module.exports = Quiz;
