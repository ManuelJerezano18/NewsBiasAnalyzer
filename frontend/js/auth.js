// auth.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBnjBn6sTwnqDjrMXdgmFZ2dugrL5OVLTI",
    authDomain: "news-bias-analyzer.firebaseapp.com",
    projectId: "news-bias-analyzer",
    storageBucket: "news-bias-analyzer.appspot.com",
    messagingSenderId: "661563307465",
    appId: "1:661563307465:web:648bdabecbcf57b0d96418",
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
