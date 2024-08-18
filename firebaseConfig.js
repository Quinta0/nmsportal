import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || ''
};

const checkFirebaseConfig = (config) => {
    return Object.keys(config).reduce((acc, key) => {
        acc[key] = config[key] ? 'Set' : 'Not set';
        return acc;
    }, {});
};

console.log('Firebase config status:', checkFirebaseConfig(firebaseConfig));

let app;
if (!getApps().length) {
    try {
        app = initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Error initializing Firebase:', error.message);
    }
} else {
    app = getApps()[0];
    console.log('Using existing Firebase app');
}

const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { auth, database, storage };