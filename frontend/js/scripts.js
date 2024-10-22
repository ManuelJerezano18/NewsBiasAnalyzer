// Ensure DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Page loaded successfully.");
});

// Import Firebase initialization and form handling from their respective modules
import { initializeFirebase, getAuthInstance } from './firebase.js';
import { handleFormSubmission } from './form_handler.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Initialize Firebase and set up form handling
initializeFirebase(); // This sets up your Firebase app and Firestore
handleFormSubmission(); // This sets up the event listener for form submission

// Check authentication status
const auth = getAuthInstance();
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in:", user.email);
    } else {
        // Redirect to sign-in page if not authenticated
        window.location.href = 'signin.html';
    }
});

// Sign-out functionality
document.getElementById('signOutButton').addEventListener('click', () => {
    signOut(auth).then(() => {
        alert('Signed out successfully!');
        window.location.href = 'signin.html';  // Redirect to sign-in page
    }).catch((error) => {
        console.error('Error during sign-out:', error.message);
    });
});
