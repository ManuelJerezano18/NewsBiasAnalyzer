import { getDb } from './firebase.js';
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

            // Return result for each chunk
            return result;
        })
        .catch(error => {
            console.error("Error in bias analysis API:", error);
            return null; // Handle API call failure
        });

        promises.push(fetchPromise);  // Store each fetch call promise

        // Move the window forward, with overlap
        start += windowSize - overlap;
        //console.log("chunk", chunk)
    }

    
    // Wait for all API calls to resolve
    const results = await Promise.all(promises);
    //await new Promise(r => setTimeout(r, 5000));
    console.log("RESULTS", results)
    return results;
}




export function handleFormSubmission() {
    document.addEventListener('DOMContentLoaded', function () {
        const carousel = document.querySelector('.carousel');
        const prevBtn = document.querySelector('#prev-btn');
        const nextBtn = document.querySelector('#next-btn');

        let currentIndex = 0;

        function updateCarousel(index) {
            // Scroll to the corresponding testimonial
            carousel.scrollTo({
                left: carousel.offsetWidth * index,
                behavior: 'smooth',
            });
        }

        // Go to the previous testimonial
        prevBtn.addEventListener('click', () => {
            console.log("click")
            currentIndex = (currentIndex === 0) ? carousel.children.length - 1 : currentIndex - 1;
            updateCarousel(currentIndex);
        });

        // Go to the next testimonial
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex === carousel.children.length - 1) ? 0 : currentIndex + 1;
            updateCarousel(currentIndex);
        });

        const submitButton = document.getElementById('submitButton');
        const urlField = document.querySelector('.url-upload input');
        const errorMessage = document.getElementById('error-message');
        const submitSection = document.getElementById('submit');
        const loadingSection = document.getElementById('loading');
        const homeSection = document.getElementById('home');
        const featuresSection = document.getElementById('features');
        const testimonialsSection = document.getElementById('testimonials');

        submitButton.addEventListener('click', async function (event) {
            event.preventDefault();
            const url = urlField.value;

            const domainStatus = isValidDomain(url);

            if (domainStatus === 1) {
                errorMessage.textContent = 'The URL format is invalid. Please enter a correct URL.';
            } else if (domainStatus === 2) {
                errorMessage.textContent = 'The article URL must be from a trusted news source.';
            } else {
                errorMessage.textContent = ''; // Clear any previous error messages

                // Show loading section and hide form
                submitSection.style.display = 'none';
                loadingSection.style.display = 'block';
                homeSection.style.display = 'none';
                featuresSection.style.display = 'none';
                testimonialsSection.style.display = 'none';

                try {
                    const article = await callScrapingAPI(url);
                    const articleText = article.text;

                    // Store article text in localStorage for retrieval on results.html
                    localStorage.setItem('articleText', articleText);

                    let analysisResults;
                    let gptAnalysisResults = null;
                    let geminiAnalysisResults = null;

                    // Handle HuggingFace API (Sliding Window Analysis)
                    try {
                        analysisResults = await getBiasAnalysisWithSlidingWindow(articleText);
                        if (analysisResults) {
                            const analysisResultsString = JSON.stringify(analysisResults);
                            localStorage.setItem('biasAnalysisResults', analysisResultsString);
                        } else {
                            throw new Error('Failed to perform sliding window analysis.');
                        }
                    } catch (error) {
                        console.error('Error in sliding window analysis:', error.message);
                        localStorage.setItem('errorMessage', `HuggingFace API Error: ${error.message}`);
                        window.location.href = 'error.html';
                        return;
                    }

                    // Handle GPT-4 Mini API
                    try {
                        const gptAnalysisResponse = await fetch('https://backend.newsbiascheck.net/analyze_bias_gpt4mini', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: articleText })
                        });

                        if (gptAnalysisResponse.ok) {
                            gptAnalysisResults = await gptAnalysisResponse.text();
                            localStorage.setItem('gptAnalysisResults', gptAnalysisResults);
                        } else {
                            throw new Error('GPT-4 Mini API failed.');
                        }
                    } catch (error) {
                        console.error('Error in GPT-4 Mini API:', error.message);
                        localStorage.setItem('errorMessage', `GPT-4 Mini API Error: ${error.message}`);
                        window.location.href = 'error.html';
                        return;
                    }

                    // Handle Gemini API
                    try {
                        const geminiAnalysisResponse = await fetch('https://backend.newsbiascheck.net/analyze_bias_gemini', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: articleText })
                        });

                        if (geminiAnalysisResponse.ok) {
                            geminiAnalysisResults = await geminiAnalysisResponse.text();
                            localStorage.setItem('geminiAnalysisResults', geminiAnalysisResults);
                        } else {
                            throw new Error('Gemini API failed.');
                        }
                    } catch (error) {
                        console.error('Error in Gemini API:', error.message);
                        localStorage.setItem('errorMessage', `Gemini API Error: ${error.message}`);
                        window.location.href = 'error.html';
                        return;
                    }

                    // Save to Firestore Database
                    try {
                        const analysisResultsString = JSON.stringify(analysisResults);

                        const db = getDb(); // Ensure this function returns your Firestore instance
                        await addDoc(collection(db, "Articles"), {
                            article_url: url,
                            submission_date: new Date(),
                            analysis_results: analysisResultsString
                        });
                    } catch (dbError) {
                        console.error('Error adding document to Firestore:', dbError.message);
                        localStorage.setItem('errorMessage', `Database Error: ${dbError.message}`);
                        window.location.href = 'error.html';
                        return;
                    }

                    // Redirect to results page if all analysis succeeds
                    window.location.href = 'results.html';
                } catch (error) {
                    console.error('Error in processing submission:', error.message);
                    localStorage.setItem('errorMessage', `An unexpected error occurred: ${error.message}`);
                    window.location.href = 'error.html';
                }
            }
        });
    });
}
