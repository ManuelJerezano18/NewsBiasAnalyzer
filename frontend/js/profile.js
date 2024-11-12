import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Use your actual Firebase configuration here
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

document.addEventListener('DOMContentLoaded', () => {
    const articleHistoryBody = document.getElementById('article-history-body');
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userNameElement.textContent = user.displayName || 'User';
            userEmailElement.textContent = user.email;

            // Fetch the user's articles from Firestore
            const userArticlesRef = collection(db, `Users/${user.uid}/Articles`);
            const querySnapshot = await getDocs(userArticlesRef);

            articleHistoryBody.innerHTML = ''; // Clear any existing data

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const row = `
                    <tr>
                        <td>${data.article_title || 'N/A'}</td>
                        <td>${data.article_url}</td>
                        <td>${data.submission_date.toDate().toLocaleDateString()}</td>
                        <td>${data.bias_score || 'N/A'}</td>
                    </tr>
                `;
                articleHistoryBody.innerHTML += row;
            });
        } else {
            window.location.href = 'signin.html'; // Redirect to sign-in if not logged in
        }
    });

    document.getElementById('signOutButton').addEventListener('click', () => {
        signOut(auth).then(() => {
            alert('Signed out successfully!');
            window.location.href = 'signin.html';
        }).catch((error) => {
            console.error('Error during sign-out:', error);
        });
    });
});
