// Make sure the DOM is fully loaded before executing the rest of the code
document.addEventListener('DOMContentLoaded', function() {
    console.log("Page loaded successfully.");
});

// Import Firebase initialization and form handling from their respective modules
import { initializeFirebase } from './firebase.js';
import { handleFormSubmission } from './form_handler.js';

// Initialize Firebase and set up form handling
initializeFirebase(); // This sets up your Firebase app and Firestore
handleFormSubmission(); // This sets up the event listener for form submission
