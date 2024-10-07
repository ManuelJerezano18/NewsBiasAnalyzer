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
    const availableHeight = emptyArea.clientHeight - 50;  // Adjust the 50px if needed for extra padding
    
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
