import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', () => {
    const articleHistoryBody = document.getElementById('article-history-body');
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');
    const userPhoneElement = document.getElementById('user-phone');
    const userWebsiteElement = document.getElementById('user-website');
    const userBirthdateElement = document.getElementById('user-birthdate');

    const editProfileButton = document.getElementById('edit-profile-button');
    const editProfileForm = document.getElementById('edit-profile-form');
    const saveProfileButton = document.getElementById('save-profile-button');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('User authenticated:', user.email); // Debug line
            userNameElement.textContent = user.displayName || 'User';
            userEmailElement.textContent = user.email;

            try {
                // Fetch user data
                const userDocRef = doc(db, `Users/${user.uid}`);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    console.log('User data:', userData); // Debug line

                    userNameElement.textContent = userData.name || 'User Name';
                    userPhoneElement.textContent = userData.phone || 'N/A';
                    userWebsiteElement.textContent = userData.website || 'N/A';
                    userBirthdateElement.textContent = userData.birthdate || 'N/A';
                } else {
                    console.log('No user data found.');
                }

                // Fetch article history
                const userArticlesRef = collection(db, `Users/${user.uid}/Articles`);
                const querySnapshot = await getDocs(userArticlesRef);
                console.log('Articles fetched:', querySnapshot.size); // Debug line

                articleHistoryBody.innerHTML = ''; // Clear any existing data
                if (querySnapshot.empty) {
                    articleHistoryBody.innerHTML = `
                        <tr>
                            <td colspan="4" style="text-align: center;">No articles submitted yet.</td>
                        </tr>
                    `;
                } else {
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        console.log('Article data:', data); // Debug line
                        const row = `
                            <tr>
                                <td>${data.article_title || 'Untitled'}</td>
                                <td><a href="${data.article_url}" target="_blank">${new URL(data.article_url).hostname}</a></td>
                                <td>${data.submission_date?.toDate().toLocaleDateString() || 'N/A'}</td>
                                <td>${data.bias_score !== undefined ? data.bias_score : 'N/A'}</td>
                            </tr>
                        `;
                        articleHistoryBody.innerHTML += row;
                    });
                }
            } catch (error) {
                console.error('Error fetching article data:', error);
                articleHistoryBody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; color: red;">Failed to load article history.</td>
                    </tr>
                `;
            }
        } else {
            console.error('User not authenticated'); // Debug line
            window.location.href = 'signin.html'; // Redirect if not logged in
        }
    });

    editProfileButton.addEventListener('click', () => {
        editProfileForm.style.display = 'block';
        editProfileButton.style.display = 'none';

        // Prefill form with current data
        document.getElementById('edit-name').value = userNameElement.textContent;
        document.getElementById('edit-email').value = userEmailElement.textContent;
        document.getElementById('edit-phone').value = userPhoneElement.textContent !== 'N/A' ? userPhoneElement.textContent : '';
        document.getElementById('edit-website').value = userWebsiteElement.textContent !== 'N/A' ? userWebsiteElement.textContent : '';
        document.getElementById('edit-birthdate').value = userBirthdateElement.textContent !== 'N/A' ? userBirthdateElement.textContent : '';
    });

    saveProfileButton.addEventListener('click', async () => {
        const name = document.getElementById('edit-name').value;
        const phone = document.getElementById('edit-phone').value;
        const website = document.getElementById('edit-website').value;
        const birthdate = document.getElementById('edit-birthdate').value;

        try {
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, `Users/${user.uid}`);
                await setDoc(userDocRef, {
                    name,
                    phone,
                    website,
                    birthdate
                }, { merge: true });

                console.log('User data saved successfully'); // Debug line

                // Update UI
                userNameElement.textContent = name || 'User Name';
                userPhoneElement.textContent = phone || 'N/A';
                userWebsiteElement.textContent = website || 'N/A';
                userBirthdateElement.textContent = birthdate || 'N/A';

                // Hide form and show button
                editProfileForm.style.display = 'none';
                editProfileButton.style.display = 'inline';
            } else {
                console.error('User not authenticated');
            }
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    });
});
