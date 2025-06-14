import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        // Firebase yapılandırma bilgilerin buraya eklendi
        const firebaseConfig = {
            apiKey: "AIzaSyA2E3IBdcwesXLPvp-NvEQ_okNuvYo7N0A",
            authDomain: "quiz-platform-3209f.firebaseapp.com",
            projectId: "quiz-platform-3209f",
            storageBucket: "quiz-platform-3209f.appspot.com",
            messagingSenderId: "340823768465",
            appId: "1:340823768465:web:b5b0853632878a3d02ae30",
            measurementId: "G-N8M7SQB5Y1"
        };

        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestoreDb);
        setAuth(firebaseAuth);

        // Kullanıcı oturum değişimini dinle
        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                // Anonim giriş
                try {
                    await signInAnonymously(firebaseAuth);
                    setUserId(firebaseAuth.currentUser?.uid || crypto.randomUUID());
                } catch (error) {
                    console.error("Anonymous login failed:", error);
                }
            }
            setIsAuthReady(true);
        });

        return () => unsubscribe(); // Cleanup
    }, []);

    return (
        <AuthContext.Provider value={{ userId, db, auth, isAuthReady, setUserId }}>
            {children}
        </AuthContext.Provider>
    );
};
