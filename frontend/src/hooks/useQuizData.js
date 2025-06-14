import { useState, useEffect } from 'react';
import { getQuizzes } from '../services/quizService'; // Hypothetical service for fetching quizzes

// This is a placeholder for a custom hook that might fetch and manage quiz data.
// For now, the quiz fetching logic is directly in QuizHostingPage.
const useQuizData = (userId) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuizzesData = async () => {
            if (!userId) {
                setLoading(false);
                setError("User not authenticated.");
                return;
            }
            try {
                setLoading(true);
                const data = await getQuizzes(); // Fetch quizzes via API service
                setQuizzes(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchQuizzesData();
    }, [userId]); // Re-fetch when userId changes

    return { quizzes, loading, error };
};

export default useQuizData;
