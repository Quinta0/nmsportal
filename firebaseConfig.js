import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

console.log('Firebase config:', {
    apiKeySet: !!firebaseConfig.apiKey,
    authDomainSet: !!firebaseConfig.authDomain,
    projectIdSet: !!firebaseConfig.projectId,
    storageBucketSet: !!firebaseConfig.storageBucket,
    messagingSenderIdSet: !!firebaseConfig.messagingSenderId,
    appIdSet: !!firebaseConfig.appId,
    databaseURLSet: !!firebaseConfig.databaseURL
});

let app;
if (!getApps().length) {
    try {
        app = initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');

        // Test authentication initialization
        const auth = getAuth(app);
        console.log('Auth initialized:', !!auth);

        // Test database initialization
        const database = getDatabase(app);
        console.log('Database initialized:', !!database);

        // Test storage initialization
        const storage = getStorage(app);
        console.log('Storage initialized:', !!storage);
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
    }
} else {
    app = getApps()[0];
    console.log('Using existing Firebase app');
}

const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { auth, database, storage };