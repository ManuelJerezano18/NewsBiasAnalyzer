import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Firebase configuration (same as in index.html)
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

// Log In functionality
document.getElementById('logInButton').addEventListener('click', async () => {
    const email = document.getElementById('logInEmail').value;
    const password = document.getElementById('logInPassword').value;
    const errorMessage = document.getElementById('error-message');

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Logged in successfully!');
        window.location.href = 'index.html'; // Redirect to the article submission page
    } catch (error) {
        errorMessage.textContent = error.message;
    }
});

// Google Sign-In functionality
document.getElementById('googleSignInButton').addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        alert('Logged in with Google successfully!');
        window.location.href = 'index.html'; // Redirect to the article submission page
    } catch (error) {
        alert('Failed to sign in with Google: ' + error.message);
    }
});
