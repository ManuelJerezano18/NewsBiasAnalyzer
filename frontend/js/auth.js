// auth.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Redirect to Sign In if the user is not logged in
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Uncomment to enable redirect if needed
        window.location.href = "signin.html"; // Redirect to sign-in page if not logged in
    }
});

// Sign out functionality
document.getElementById('signOutButton').addEventListener('click', () => {
    signOut(auth).then(() => {
        alert('Signed out successfully!');
        window.location.href = 'signin.html'; // Redirect to sign-in page after signing out
    }).catch((error) => {
        console.error('Error during sign-out:', error.message);
    });
});

export { auth };
