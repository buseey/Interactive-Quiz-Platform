const express = require('express');
const { createQuiz, getQuizzes, getQuizById, updateQuiz, deleteQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware'); // Middleware for protected routes
const router = express.Router();

// Protect all quiz routes (only authenticated users can access)
router.use(protect);

// Route for creating a new quiz
router.post('/', createQuiz);

// Route for getting all quizzes for the authenticated user
router.get('/', getQuizzes);

// Route for getting a single quiz by ID
router.get('/:id', getQuizById);

// Route for updating a quiz by ID
router.put('/:id', updateQuiz);

// Route for deleting a quiz by ID
router.delete('/:id', deleteQuiz);

module.exports = router;
