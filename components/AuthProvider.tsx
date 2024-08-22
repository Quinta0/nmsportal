import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, database } from '@/firebaseConfig';
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';

interface AuthContextType {
    user: User | null;
    signUp: (email: string, password: string, friendCode: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    logOut: () => Promise<void>;
    setFriendCode: (code: string) => Promise<void>;
    friendCode: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [friendCode, setFriendCode] = useState<string | null>(null);

    useEffect(() => {
        // Ensure that this code only runs in the browser
        if (typeof window !== 'undefined') {
            const unsubscribe = auth.onAuthStateChanged(async (user) => {
                setUser(user);
                if (user) {
                    const friendCodeRef = ref(database, `users/${user.uid}/friendCode`);
                    const snapshot = await get(friendCodeRef);
                    if (snapshot.exists()) {
                        setFriendCode(snapshot.val());
                    }
                } else {
                    setFriendCode(null);
                }
            });
            return unsubscribe;
        }
    }, []);

    const signUp = async (email: string, password: string, friendCode: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await set(ref(database, `users/${userCredential.user.uid}/friendCode`), friendCode);
        setFriendCode(friendCode);
    };

    const signIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logOut = async () => {
        await signOut(auth);
        setFriendCode(null);
    };

    const setFriendCodeForUser = async (code: string) => {
        if (user) {
            await set(ref(database, `users/${user.uid}/friendCode`), code);
            setFriendCode(code);
        }
    };

    const contextValue = {
        user,
        signUp,
        signIn,
        logOut,
        setFriendCode: setFriendCodeForUser,
        friendCode
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
