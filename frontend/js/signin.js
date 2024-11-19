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

// Sign-In button functionality
document.getElementById('logInButton').addEventListener('click', async () => {
    console.log("Sign-In button clicked"); // Debugging log

    const email = document.getElementById('logInEmail').value;
    const password = document.getElementById('logInPassword').value;
    const errorMessage = document.getElementById('error-message');

    // Check if email and password are provided
    if (!email || !password) {
        errorMessage.textContent = 'Please enter an email and password.';
        console.warn("Email or password missing"); // Debugging log
        return;
    }

    try {
        // Attempt sign-in with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in:", userCredential.user.uid); // Debugging log
        alert('Logged in successfully!');
        window.location.href = 'index.html'; // Redirect to main page on success
    } catch (error) {
        console.error("Error during sign-in:", error.message); // Detailed error log
        errorMessage.textContent = error.message; // Display the error to the user
    }
});

// Google Sign-In button functionality
document.getElementById('googleSignInButton').addEventListener('click', async () => {
    console.log("Google Sign-In button clicked"); // Debugging log

    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("User signed in with Google:", result.user.uid); // Debugging log
        alert('Logged in with Google successfully!');
        window.location.href = 'index.html'; // Redirect to main page on success
    } catch (error) {
        console.error("Error during Google sign-in:", error.message); // Detailed error log
        alert('Failed to sign in with Google: ' + error.message); // Display error to the user
    }
});
