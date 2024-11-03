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
        const response = await fetch('http://127.0.0.1:5000/scrape', {
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






// Function to call Hugging Face bias analysis API
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

async function analyzeWithMultipleModels(articleText) {
    const models = [
        { name: 'GPT4-mini', analyzeFunc: analyzeWithGPT4Mini },
        { name: 'Gemini', analyzeFunc: analyzeWithGemini },
        // Add other models here as needed
    ];

    const analysisResults = {};

    // Loop through each model and get analysis results
    for (const model of models) {
        try {
            const result = await model.analyzeFunc(articleText);
            analysisResults[model.name] = result;
        } catch (error) {
            console.error(`Error analyzing with ${model.name}:`, error);
            analysisResults[model.name] = { error: `Failed to analyze with ${model.name}` };
        }
    }

    return analysisResults;
}


async function analyzeWithGPT4Mini(articleText) {
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-4o-mini", // Adjust this if there is a specific variant of GPT-4 Mini you are using
            messages: [
                { role: "system", content: "You are an advanced text analyst with a keen understanding of media bias and rhetoric. You have spent the last 15 years developing algorithms and methodologies to evaluate the objectivity of news articles across various genres and formats. Your expertise allows you to dissect language, tone, and framing techniques to deliver reliable bias assessments.Your task is to analyze a provided news article for bias. Please consider the specific language used, the framing of facts, the presence of subjective opinions, and the overall tone of the article in your analysis. You will be given the details of the article you need to evaluate. While analyzing, please keep in mind the following criteria: identify any emotionally charged language, potential omissions of important facts, the balance of perspectives presented, and any other indicators of bias. Finally, provide only the percentage of bias that accurately reflects your assessment." },
                { role: "user", content: `Analyze the following article for political or ideological bias:\n\n${articleText}` }
            ],
            max_tokens: 100  // Set a max token limit to manage output size (adjust as needed)
        });

        const result = response.data.choices[0].message.content;
        console.log("GPT-4 Mini analysis result:", result);
        return result;
    } catch (error) {
        console.error("Error in GPT-4 Mini API:", error);
        return { error: "Failed to analyze with GPT-4 Mini" };
    }
}


export function handleFormSubmission() {
    document.addEventListener('DOMContentLoaded', function() {
        const submitButton = document.getElementById('submitButton');
        const urlField = document.querySelector('.url-upload input');
        const errorMessage = document.getElementById('error-message');
        const submitSection = document.getElementById('submit');
        const loadingSection = document.getElementById('loading');
        const homeSection = document.getElementById('home');
        const featuresSection = document.getElementById('features');
        const testimonialsSection = document.getElementById('testimonials');

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
                    const article = await callScrapingAPI(url);
                    const articleText = article.text;

                    // Store article text in localStorage for retrieval on results.html
                    localStorage.setItem('articleText', articleText);

                    // Pass the articleText to the new analysis function
                    const analysisResults = await getBiasAnalysisWithSlidingWindow(articleText);

                    const gptAnalysisResponse = await fetch('http://127.0.0.1:5000/analyze_bias_gpt4mini', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: articleText })
                    });
                    
                    if (!gptAnalysisResponse.ok) {
                        await new Promise(r => setTimeout(r, 5000));
                        console.log("fail gpt4mini");
                        throw new Error("Analysis failed");
                    }
                    
                    // Read as text first, then parse if needed
                    const responseText = await gptAnalysisResponse.text();
                    const gptAnalysisResults = { analysisText: responseText };
                    console.log("Raw response text:", responseText);


                    const geminiAnalysisResponse = await fetch('http://127.0.0.1:5000/analyze_bias_gemini', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: articleText })
                    });
                    
                    if (!geminiAnalysisResponse.ok) {
                        await new Promise(r => setTimeout(r, 5000));
                        console.log("fail gemini");
                        throw new Error("Analysis failed");
                    }
                    
                    // Read as text first, then parse if needed
                    const geminiResponseText = await geminiAnalysisResponse.text();
                    const geminiAnalysisResults = { analysisText: geminiResponseText };
                    console.log("Raw response text gemini:", geminiResponseText);
                    await new Promise(r => setTimeout(r, 15000));


                    localStorage.setItem('geminiAnalysisResults', responseText);
                    localStorage.setItem('gptAnalysisResults', geminiResponseText);
                    await new Promise(r => setTimeout(r, 15000));
                    
                    //const gptAnalysisResults = await analyzeWithMultipleModels(articleText);
                    //console.log(gptAnalysisResults)
                    if (analysisResults) {
                        const analysisResultsString = JSON.stringify(analysisResults);

                        const db = getDb();
                        await addDoc(collection(db, "Articles"), {
                            article_url: url,
                            submission_date: new Date(),
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
        });
    });
}

