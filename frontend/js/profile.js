import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { query, orderBy } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

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
    const profilePictureInput = document.getElementById('profile-picture-input');
    const profilePictureImg = document.getElementById('profile-picture-img');
    const editProfileButton = document.getElementById('edit-profile-button');
    const editProfileForm = document.getElementById('edit-profile-form');
    const saveProfileButton = document.getElementById('save-profile-button');

    /**
     * Centralized function to create or update a user's Firestore document.
     * Merges new data with the existing document.
     */
    async function createOrUpdateUserDocument(userId, data) {
        try {
            const userDocRef = doc(db, `Users/${userId}`);
            await setDoc(userDocRef, data, { merge: true });
            console.log("User document created/updated successfully:", data);
        } catch (error) {
            console.error("Error creating/updating user document:", error);
        }
    }

    /**
     * Function to fetch and display the user's article history.
     */
    async function fetchArticleHistory(userId) {
        try {
            const userArticlesRef = collection(db, `Users/${userId}/Articles`);
            const querySnapshot = await getDocs(query(userArticlesRef, orderBy('submission_date', 'desc')));
            console.log('Articles fetched:', querySnapshot.size);
    
            articleHistoryBody.innerHTML = ''; // Clear any existing data
            if (querySnapshot.empty) {
                articleHistoryBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center;">No articles submitted yet.</td>
                    </tr>
                `;
            } else {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    console.log('Article data:', data);
                    const row = `
                        <tr id="article-${doc.id}">
                            <td>${data.article_title || 'Untitled'}</td>
                            <td><a href="${data.article_url}" target="_blank">${new URL(data.article_url).hostname}</a></td>
                            <td>${data.category || 'N/A'}</td>
                            <td>${data.submission_date?.toDate().toLocaleDateString() || 'N/A'}</td>
                            <td>${data.bias_score !== undefined ? data.bias_score : 'N/A'}</td>
                            <td><button class="delete-btn" data-id="${doc.id}">Delete</button></td>
                        </tr>
                    `;
                    articleHistoryBody.innerHTML += row;
                });
    
                // Add event listeners for delete buttons
                document.querySelectorAll('.delete-btn').forEach((button) => {
                    button.addEventListener('click', async (event) => {
                        const articleId = event.target.getAttribute('data-id');
                        await deleteArticle(userId, articleId);
                    });
                });
            }
        } catch (error) {
            console.error('Error fetching article history:', error);
            articleHistoryBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: red;">Failed to load article history.</td>
                </tr>
            `;
        }
    }

    // Load profile picture from localStorage
    const savedProfilePicture = localStorage.getItem("profilePicture");
    if (savedProfilePicture) {
        profilePictureImg.src = savedProfilePicture;
    }

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('User authenticated:', user.email);

            // Set default values for the user information
            userNameElement.textContent = user.displayName || 'User';
            userEmailElement.textContent = user.email;

            try {
                const userDocRef = doc(db, `Users/${user.uid}`);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    console.log('User data:', userData);

                    userNameElement.textContent = userData.name || 'User Name';
                    userPhoneElement.textContent = userData.phone || 'N/A';
                    userWebsiteElement.textContent = userData.website || 'N/A';
                    userBirthdateElement.textContent = userData.birthdate || 'N/A';
                } else {
                    console.log('No user data found. Creating a new document.');
                    await createOrUpdateUserDocument(user.uid, {
                        name: "User Name",
                        email: user.email,
                        phone: "N/A",
                        website: "N/A",
                        birthdate: "N/A"
                    });
                }

                // Fetch article history
                await fetchArticleHistory(user.uid);
            } catch (error) {
                console.error('Error fetching or creating user data:', error);
            }
        } else {
            console.error('User not authenticated');
            window.location.href = 'signin.html';
        }
    });

    // Save profile picture to localStorage and update UI
    profilePictureInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const imageDataUrl = reader.result;
                localStorage.setItem("profilePicture", imageDataUrl);
                profilePictureImg.src = imageDataUrl;
            };
            reader.readAsDataURL(file);
        }
    });

    saveProfileButton.addEventListener('click', async () => {
        const name = document.getElementById('edit-name').value;
        const phone = document.getElementById('edit-phone').value;
        const website = document.getElementById('edit-website').value;
        const birthdate = document.getElementById('edit-birthdate').value;

        try {
            const user = auth.currentUser;
            if (user) {
                await createOrUpdateUserDocument(user.uid, { name, phone, website, birthdate });
                console.log("User profile updated successfully.");

                userNameElement.textContent = name || 'User Name';
                userPhoneElement.textContent = phone || 'N/A';
                userWebsiteElement.textContent = website || 'N/A';
                userBirthdateElement.textContent = birthdate || 'N/A';

                editProfileForm.style.display = 'none';
                editProfileButton.style.display = 'inline';
            } else {
                console.error("User not authenticated");
            }
        } catch (error) {
            console.error("Error saving user data:", error);
        }
    });

    async function deleteArticle(userId, articleId) {
        try {
            await deleteDoc(doc(db, `Users/${userId}/Articles`, articleId));
            document.getElementById(`article-${articleId}`).remove();
            console.log(`Article ${articleId} deleted successfully.`);
        } catch (error) {
            console.error(`Error deleting article ${articleId}:`, error);
        }
    }
});
