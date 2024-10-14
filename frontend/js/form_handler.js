import { getDb } from './firebase.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Valid domains
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

function isValidDomain(url) {
    try {
        const parsedUrl = new URL(url);
        const domain = parsedUrl.hostname;
        
        // Check if the domain ends with any of the trusted sources
        const isTrusted = validDomains.some(validDomain => domain.endsWith(validDomain));
        
        return isTrusted ? 0 : 2; // 0 for success, 2 for untrusted source
    } catch (error) {
        console.error("Invalid URL format:", error.message);
        return 1; // 1 for incorrect URL format
    }
}

async function callScrapingAPI(url) {
    try {
        const response = await fetch('http://localhost:5000/scrape', {
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

async function getBiasAnalysis(articleText) {
    const apiKey = "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"; 
    const apiUrl = "https://api-inference.huggingface.co/models/d4data/bias-detection-model";

    const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
    };

    const body = { inputs: articleText };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        });

        const result = await response.json();
        console.log("Bias analysis result:", result);
        return result;
    } catch (error) {
        console.error("Error in bias analysis API:", error);
        return null;
    }
}

export function handleFormSubmission() {
    document.addEventListener('DOMContentLoaded', function() {
        const submitButton = document.getElementById('submitButton');
        const urlField = document.querySelector('.url-upload input');
        const outputField = document.getElementById('output');
        const errorMessage = document.getElementById('error-message');
        const submitSection = document.getElementById('submit');
        const loadingSection = document.getElementById('loading');
        const homeSection = document.getElementById('home');
        const featuresSection = document.getElementById('features');
        const testimonialsSection = document.getElementById('testimonials');



        if (!submitButton || !urlField) {
            console.error("Submit button or URL field not found in the DOM.");
            return;
        }

        submitButton.addEventListener('click', async function(event) {
            event.preventDefault();
            const url = urlField.value;

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
                    const articleText = "This is a sample article content for bias analysis."; 
                    const biasAnalysisResult = await getBiasAnalysis(articleText);

                    if (biasAnalysisResult) {
                        if (biasAnalysisResult.error && biasAnalysisResult.error.includes("loading")) {
                            localStorage.setItem('errorMessage', "The model is currently loading. Please try again later.");
                            window.location.href = 'error.html';
                        } else {
                            const biasAnalysisString = JSON.stringify(biasAnalysisResult);

                            const db = getDb();
                            await addDoc(collection(db, "Articles"), {
                                article_url: url,
                                submission_date: new Date(),
                                bias_analysis: biasAnalysisString
                            });

                            // Store the result in localStorage before redirecting
                            localStorage.setItem('biasAnalysisResult', biasAnalysisString);
                            window.location.href = 'results.html';
                        }
                    } else {
                        // If analysis failed, store an error message and redirect to error page
                        localStorage.setItem('errorMessage', 'Failed to perform bias analysis. Please try again.');
                        window.location.href = 'error.html';
                    }
                } catch (error) {
                    console.error("Error submitting the article:", error);
                    // Store the error message in local storage and redirect to error page
                    localStorage.setItem('errorMessage', 'An error occurred while submitting the article. Please try again.');
                    window.location.href = 'error.html';
                }
            }
        });
    });
}
