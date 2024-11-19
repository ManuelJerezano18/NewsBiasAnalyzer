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








/*

// Simulated data for the articles
const articleHistory = [
    { name: "Breaking News", website: "example.com", date: "2024-10-05", biasScore: 0.2 },
    { name: "Election Analysis", website: "newswebsite.com", date: "2024-10-04", biasScore: -0.5 },
    { name: "Climate Change Report", website: "scienceblog.com", date: "2024-10-03", biasScore: 0.1 },
    { name: "Tech Innovations", website: "techdaily.com", date: "2024-10-02", biasScore: 0.3 },
    { name: "Sports Highlights", website: "sportshub.com", date: "2024-10-01", biasScore: -0.2 },
    { name: "Global Politics", website: "worldnews.com", date: "2024-09-30", biasScore: 0.4 },
    { name: "Economy Watch", website: "economicstoday.com", date: "2024-09-29", biasScore: -0.1 },
    { name: "Health and Wellness", website: "healthdaily.com", date: "2024-09-28", biasScore: 0.0 },
    { name: "Movie Reviews", website: "filmcritic.com", date: "2024-09-27", biasScore: 0.5 },
    { name: "Fashion Trends", website: "fashiondaily.com", date: "2024-09-26", biasScore: 0.3 },
    { name: "Local News", website: "localnews.com", date: "2024-09-25", biasScore: -0.2 },
    { name: "Technology Breakthrough", website: "techinsider.com", date: "2024-09-24", biasScore: 0.2 },
    { name: "Political Commentary", website: "opinionhub.com", date: "2024-09-23", biasScore: -0.4 },
    { name: "Economic Forecast", website: "financeworld.com", date: "2024-09-22", biasScore: 0.1 },
    { name: "Science Discoveries", website: "sciencenews.com", date: "2024-09-21", biasScore: 0.0 },
    { name: "Travel Guide", website: "traveler.com", date: "2024-09-20", biasScore: 0.4 },
    { name: "Gadget Reviews", website: "techreviewer.com", date: "2024-09-19", biasScore: -0.1 },
    { name: "Entertainment News", website: "hollywoodbuzz.com", date: "2024-09-18", biasScore: 0.3 },
    { name: "Food and Cooking", website: "recipebook.com", date: "2024-09-17", biasScore: 0.0 },
    { name: "Political Debate", website: "debatezone.com", date: "2024-09-16", biasScore: -0.5 },
    { name: "World News", website: "globalupdate.com", date: "2024-09-15", biasScore: 0.2 },
    { name: "Health Trends", website: "healthinsights.com", date: "2024-09-14", biasScore: 0.1 },
    { name: "Sports Update", website: "sportsdaily.com", date: "2024-09-13", biasScore: -0.2 },
    { name: "Business Report", website: "businesswatch.com", date: "2024-09-12", biasScore: 0.3 },
    { name: "Celebrity Gossip", website: "starpulse.com", date: "2024-09-11", biasScore: 0.5 },
    { name: "Science News", website: "dailytech.com", date: "2024-09-10", biasScore: 0.1 },
    { name: "Opinion Article", website: "opinionworld.com", date: "2024-09-09", biasScore: -0.4 },
    { name: "International Affairs", website: "foreignnews.com", date: "2024-09-08", biasScore: 0.0 },
    { name: "Food Review", website: "foodie.com", date: "2024-09-07", biasScore: 0.2 },
    { name: "Tech Review", website: "gadgetworld.com", date: "2024-09-06", biasScore: -0.3 },
    { name: "Movie Premiere", website: "cinemahub.com", date: "2024-09-05", biasScore: 0.5 },
    { name: "Political Coverage", website: "nationnews.com", date: "2024-09-04", biasScore: -0.1 },
    { name: "Economic Update", website: "marketwatch.com", date: "2024-09-03", biasScore: 0.4 },
    { name: "Local Event", website: "citynews.com", date: "2024-09-02", biasScore: -0.2 },
    { name: "Technology Overview", website: "techup.com", date: "2024-09-01", biasScore: 0.3 }
];





window.addEventListener('load', () => {
    // Get the available height of the empty area
    const emptyArea = document.querySelector('.profile-info');
    const table = document.querySelector('.article-history-table');
    
    // Get the computed height of the empty area minus some padding/margin
    const availableHeight = emptyArea.clientHeight - 200;  // this will need fixing later (to dynamic)
    
    // Estimate the height of a table row (this may vary depending on styling)
    const estimatedRowHeight = 45; // Rough estimate for the row height in pixels
    
    // Calculate how many rows can fit in the available height
    const rowsPerPage = Math.floor(availableHeight / estimatedRowHeight);
    
    // Pagination variables
    let currentPage = 1;
    const totalPages = Math.ceil(articleHistory.length / rowsPerPage);
    
    // Function to render the table
    function renderTable(page) {
        const tbody = document.getElementById('article-history-body');
        tbody.innerHTML = '';  // Clear existing table rows

        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageData = articleHistory.slice(start, end);

        // Add actual rows to the table
        pageData.forEach(article => {
            const row = `
                <tr>
                    <td>${article.name}</td>
                    <td>${article.website}</td>
                    <td>${article.date}</td>
                    <td>${article.biasScore}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        // Add empty rows if necessary to fill up the table
        const emptyRowsToAdd = rowsPerPage - pageData.length;
        for (let i = 0; i < emptyRowsToAdd; i++) {
            const emptyRow = `
                <tr>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                </tr>
            `;
            tbody.innerHTML += emptyRow;
        }

        // Update pagination buttons
        document.getElementById('current-page').textContent = `Page ${page}`;
        document.getElementById('prev-page').disabled = page === 1;
        document.getElementById('next-page').disabled = page === totalPages;
    }

    // Pagination button event listeners
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable(currentPage);
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable(currentPage);
        }
    });

    // Initial table render
    renderTable(currentPage);
});
*/