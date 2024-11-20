import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

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

// Sign-In with email and password
document.getElementById('logInButton').addEventListener('click', async () => {
    const email = document.getElementById('logInEmail').value;
    const password = document.getElementById('logInPassword').value;
    const errorMessage = document.getElementById('error-message');

    try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('Logged in successfully!');
        window.location.href = 'profile.html'; // Redirect to profile page
    } catch (error) {
        errorMessage.textContent = error.message;
        console.error("Login error:", error);
    }
});


// Google Sign-In
document.getElementById('googleSignInButton').addEventListener('click', async () => {
    console.log("Google Sign-In button clicked");

    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("User signed in with Google:", result.user.uid);
        alert('Logged in with Google successfully!');
        window.location.href = 'index.html'; // Redirect to the main page
    } catch (error) {
        console.error("Error during Google sign-in:", error.message);
        alert('Failed to sign in with Google: ' + error.message);
    }
});
