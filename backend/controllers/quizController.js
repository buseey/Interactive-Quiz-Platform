const Quiz = require('../models/Quiz');

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (only authenticated users can create quizzes)
const createQuiz = async (req, res) => {
    const { title, description, questions } = req.body;

    // The user's ID is available in req.user after authentication middleware
    const createdBy = req.user._id;

    try {
        const quiz = await Quiz.create({
            title,
            description,
            questions,
            createdBy,
        });
        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Error creating quiz', error: error.message });
    }
};

// @desc    Get all quizzes for the authenticated user
// @route   GET /api/quizzes
// @access  Private
const getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ createdBy: req.user._id });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quizzes', error: error.message });
    }
};

// @desc    Get a single quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (quiz && quiz.createdBy.toString() === req.user._id.toString()) {
            res.json(quiz);
        } else if (quiz && quiz.createdBy.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'Not authorized to view this quiz' });
        }
        else {
            res.status(404).json({ message: 'Quiz not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quiz', error: error.message });
    }
};

// @desc    Update a quiz by ID
// @route   PUT /api/quizzes/:id
// @access  Private
const updateQuiz = async (req, res) => {
    const { title, description, questions } = req.body;

    try {
        const quiz = await Quiz.findById(req.params.id);

        if (quiz && quiz.createdBy.toString() === req.user._id.toString()) {
            quiz.title = title || quiz.title;
            quiz.description = description || quiz.description;
            quiz.questions = questions || quiz.questions; // Allow full replacement of questions

            const updatedQuiz = await quiz.save();
            res.json(updatedQuiz);
        } else if (quiz && quiz.createdBy.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'Not authorized to update this quiz' });
        } else {
            res.status(404).json({ message: 'Quiz not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating quiz', error: error.message });
    }
};

// @desc    Delete a quiz by ID
// @route   DELETE /api/quizzes/:id
// @access  Private
const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (quiz && quiz.createdBy.toString() === req.user._id.toString()) {
            await quiz.deleteOne(); // Use deleteOne() on the document instance
            res.json({ message: 'Quiz removed' });
        } else if (quiz && quiz.createdBy.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'Not authorized to delete this quiz' });
        } else {
            res.status(404).json({ message: 'Quiz not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting quiz', error: error.message });
    }
};

module.exports = { createQuiz, getQuizzes, getQuizById, updateQuiz, deleteQuiz };
