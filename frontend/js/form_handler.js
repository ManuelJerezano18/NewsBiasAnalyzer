import { getDb } from './firebase.js';
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Valid domains list
const validDomains = [
    'nytimes.com', 'bbc.com', 'cnn.com', 'theguardian.com',
    'reuters.com', 'washingtonpost.com', 'forbes.com', 'bloomberg.com',
    'aljazeera.com', 'npr.org', 'medium.com', 'hbr.org', 
    'wired.com', 'theatlantic.com', 'techcrunch.com', 
    'businessinsider.com', 'nationalgeographic.com', 'vox.com',
    'economist.com', 'newyorker.com', 'politico.com',
    'apnews.com', 'abcnews.go.com', 'cbsnews.com', 'nbcnews.com',
    'usatoday.com', 'latimes.com', 'newsweek.com', 'time.com',
    'msnbc.com', 'wsj.com', 'chicagotribune.com', 'bostonglobe.com',
    'thehill.com', 'foxnews.com', 'sky.com', 'independent.co.uk',
    'telegraph.co.uk', 'ft.com', 'japantimes.co.jp', 'lemonde.fr',
    'marketwatch.com', 'investopedia.com', 'cnbc.com', 'techradar.com',
    'venturebeat.com', 'engadget.com', 'zdnet.com', 'arstechnica.com',
    'scientificamerican.com', 'nature.com', 'sciencemag.org', 'pnas.org',
    'nih.gov', 'newscientist.com', 'dw.com', 'cbc.ca', 'globalnews.ca',
    'smh.com.au', 'abc.net.au', 'ctvnews.ca', 'lefigaro.fr', 'elpais.com',
    'spiegel.de', 'thetimes.co.uk'
];

// Function to check if the URL is valid and from a trusted domain
function isValidDomain(url) {
    try {
        const parsedUrl = new URL(url);
        const domain = parsedUrl.hostname;
        
        const isTrusted = validDomains.some(validDomain => domain.endsWith(validDomain));
        return isTrusted ? 0 : 2; // 0 for success, 2 for untrusted source
    } catch (error) {
        console.error("Invalid URL format:", error.message);
        return 1; // 1 for incorrect URL format
    }
}

// Function to call the backend scraping API (Flask)
async function callScrapingAPI(url) {
    try {
        const response = await fetch('https://backend.newsbiascheck.net/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url }),
        });

        if (!response.ok) {
            throw new Error('Error scraping article');
        }

        const scrapedData = await response.json();
        return scrapedData;
    } catch (error) {
        console.error('Scraping error:', error);
        return null;
    }
}

// Function for calling the Hugging Face API with sliding window
async function getBiasAnalysisWithSlidingWindow(articleText, windowSize = 500, overlap = 50) {
    const apiKey = "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"; 
    const apiUrl = "https://api-inference.huggingface.co/models/d4data/bias-detection-model";

    const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
    };

    let promises = [];  // Array to store all API call promises
    let start = 0;

    // Sliding window through the article
    while (start < articleText.length) {
        const chunk = articleText.slice(start, start + windowSize);
        const body = { inputs: chunk };

        // Create an async task for each API call and push to the promises array
        const fetchPromise = fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        })
        .then(response => response.json())
        .then(result => {
            if (result.error) {
                console.error("Error in API call:", result.error);
                return null; // Handle error here
            }
            return result;
        })
        .catch(error => {
            console.error("Error in bias analysis API:", error);
            return null; // Handle API call failure
        });

        promises.push(fetchPromise);  // Store each fetch call promise

        // Move the window forward, with overlap
        start += windowSize - overlap;
    }

    // Wait for all API calls to resolve
    const results = await Promise.all(promises);
    console.log("Bias analysis results:", results);
    return results;
}

// Handle form submission
// Function to handle form submission
export function handleFormSubmission() {
    document.addEventListener('DOMContentLoaded', function() {
        const submitButton = document.getElementById('submitButton');
        const urlField = document.querySelector('.url-upload input');
        const categoryField = document.getElementById('articleCategory'); // New category field
        const errorMessage = document.getElementById('error-message');
        const submitSection = document.getElementById('submit');
        const loadingSection = document.getElementById('loading');
        const homeSection = document.getElementById('home');
        const featuresSection = document.getElementById('features');
        const testimonialsSection = document.getElementById('testimonials');

        // Initialize Firebase Auth
        const auth = getAuth();

        submitButton.addEventListener('click', async function(event) {
            event.preventDefault();
            const user = auth.currentUser;

            if (user) {
                const url = urlField.value;
                const category = categoryField.value; // Get selected category
                const domainStatus = isValidDomain(url);

                if (domainStatus === 1) {
                    errorMessage.textContent = 'The URL format is invalid. Please enter a correct URL.';
                } else if (domainStatus === 2) {
                    errorMessage.textContent = 'The article URL must be from a trusted news source.';
                } else {
                    errorMessage.textContent = '';  // Clear any previous error messages

                    // Show loading section and hide form
                    submitSection.style.display = 'none';
                    loadingSection.style.display = 'block';
                    homeSection.style.display = 'none';
                    featuresSection.style.display = 'none';
                    testimonialsSection.style.display = 'none';

                    try {
                        const article = await callScrapingAPI(url);
                        const articleText = article.text;
                        const articleTitle = article.title || 'Untitled'; // Extract title if available

                        // Store article text in localStorage for retrieval on results.html
                        localStorage.setItem('articleText', articleText);

                        // Perform bias analysis
                        const analysisResults = await getBiasAnalysisWithSlidingWindow(articleText);
                        const biasScore = analysisResults ? analysisResults.overallBiasScore || 'N/A' : 'N/A';

                        if (analysisResults) {
                            const analysisResultsString = JSON.stringify(analysisResults);

                            const db = getDb();
                            await addDoc(collection(db, `Users/${user.uid}/Articles`), {
                                article_title: articleTitle,
                                article_url: url,
                                category: category, // Store category in Firebase
                                submission_date: new Date(),
                                bias_score: biasScore,
                                analysis_results: analysisResultsString
                            });

                            // Store the analysis results in localStorage before redirecting
                            localStorage.setItem('biasAnalysisResults', analysisResultsString);

                            // Redirect to results page
                            window.location.href = 'results.html';
                        } else {
                            localStorage.setItem('errorMessage', 'Failed to perform bias analysis. Please try again.');
                            window.location.href = 'error.html';
                        }
                    } catch (error) {
                        localStorage.setItem('errorMessage', `An error occurred: ${error.message}`);
                        window.location.href = 'error.html';
                    }
                }
            } else {
                console.error("User is not authenticated");
                alert("Please sign in to submit an article.");
                window.location.href = 'signin.html'; // Redirect to sign-in page if not authenticated
            }
        });
    });
}
