import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

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
const db = getFirestore(app);

// Sign-up functionality
document.getElementById('signUpButton').addEventListener('click', async () => {
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const errorMessage = document.getElementById('error-message');

    try {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Automatically create user collection in Firestore
        const userRef = doc(db, "Users", user.uid);
        await setDoc(userRef, {
            email: user.email,
            createdAt: new Date()
        });

        alert('Account created successfully!');
        window.location.href = 'signin.html'; // Redirect to the sign-in page
    } catch (error) {
        errorMessage.textContent = error.message;
        console.error("Error creating user document:", error);
    }
});