import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Firebase configuration (same as your other files)
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

// Sign-up functionality
document.getElementById('signUpButton').addEventListener('click', async () => {
  const email = document.getElementById('signUpEmail').value;
  const password = document.getElementById('signUpPassword').value;
  const errorMessage = document.getElementById('error-message');

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert('Account created successfully!');
    window.location.href = 'signin.html'; // Redirect to the sign-in page
  } catch (error) {
    errorMessage.textContent = error.message;
  }
});
