document.addEventListener('DOMContentLoaded', function() {
    const articleContainer = document.getElementById('article-container');
    const analysisContainer = document.getElementById('analysis-container');
    const toggleButton = document.getElementById('toggleModelButton');
    const articleText = localStorage.getItem('articleText');
    const hfBiasAnalysis = JSON.parse(localStorage.getItem('biasAnalysisResult'));
    const gptAnalysisResults = localStorage.getItem('gptAnalysisResults'); // Stored as plain text
    const geminiAnalysisResults = localStorage.getItem('geminiAnalysisResults'); // Stored as plain text
    let currentModel = 'huggingface';

    const analysisDiv = document.createElement('div');
    analysisDiv.className = 'analysis-div';

    toggleButton.addEventListener('click', () => {
        // Cycle through the models in sequence
        if (currentModel === 'huggingface') {
            currentModel = 'gpt4mini';
            toggleButton.textContent = 'Switch to Gemini Flash';
        } else if (currentModel === 'gpt4mini') {
            currentModel = 'gemini';
            toggleButton.textContent = 'Switch to Hugging Face';
        } else {
            currentModel = 'huggingface';
            toggleButton.textContent = 'Switch to GPT-4 Mini';
        }
        
        renderAnalysis();  // Re-render analysis based on the selected model
    });

    function renderAnalysis() {
        if (currentModel === 'huggingface') {
            analysisDiv.style.display = 'none';
            // Call the function to display Hugging Face analysis
            displayHuggingFaceAnalysis();
        } else if (currentModel === 'gpt4mini') {
            analysisDiv.style.display = 'block';
            // Call the function to display GPT-4 Mini analysis
            displayGPT4MiniAnalysis();
        } else if (currentModel === 'gemini') {
            analysisDiv.style.display = 'block';
            // Call the function to display Gemini Flash analysis
            displayGeminiFlashAnalysis();
        }
    }

    function displayHuggingFaceAnalysis() {
        const windowSize = 500;
        const overlap = 50;
        let start = 0;
        

        while (start < articleText.length) {
            let chunk = articleText.slice(start, start + windowSize).trim();
            const biasResultIndex = Math.floor(start / (windowSize - overlap));
            const biasResult = hfBiasAnalysis[biasResultIndex];

            const chunkWrapper = document.createElement('div');
            chunkWrapper.className = 'chunk-wrapper';

            const chunkDiv = document.createElement('div');
            chunkDiv.className = 'chunk-text';
            chunkDiv.textContent = chunk;

            const biasDiv = document.createElement('div');
            biasDiv.className = 'bias-analysis';
            if (biasResult && biasResult[0]) {
                biasResult[0].forEach(result => {
                    const labelDiv = document.createElement('div');
                    labelDiv.className = `label ${result.label === "Biased" ? "biased" : "non-biased"}`;
                    labelDiv.textContent = `${result.label}: ${(result.score * 100).toFixed(2)}%`;
                    biasDiv.appendChild(labelDiv);
                });
            } else {
                biasDiv.textContent = "No analysis available for this chunk";
            }

            chunkWrapper.appendChild(chunkDiv);
            chunkWrapper.appendChild(biasDiv);
            articleContainer.appendChild(chunkWrapper);

            start += windowSize - overlap;
        }
        analysisDiv.textContent = `Gemini Bias Analysis: ${geminiAnalysisResults}`;
    }

    function displayGPT4MiniAnalysis() {
        articleContainer.textContent = '';
        const articleWrapper = document.createElement('div');
        articleWrapper.className = 'article-wrapper';

        const articleDiv = document.createElement('div');
        articleDiv.className = 'article-text';
        articleDiv.textContent = articleText;

        analysisDiv.textContent = `GPT-4 Mini Bias Analysis: ${gptAnalysisResults}`;

        articleWrapper.appendChild(articleDiv);
        articleWrapper.appendChild(analysisDiv);
        articleContainer.appendChild(articleWrapper);
    }

    function displayGeminiFlashAnalysis() {
        articleContainer.textContent = '';
        const articleWrapper = document.createElement('div');
        articleWrapper.className = 'article-wrapper';

        const articleDiv = document.createElement('div');
        articleDiv.className = 'article-text';
        articleDiv.textContent = articleText;

        analysisDiv.textContent = `Gemini Bias Analysis: ${geminiAnalysisResults}`;

        articleWrapper.appendChild(articleDiv);
        articleWrapper.appendChild(analysisDiv);
        articleContainer.appendChild(articleWrapper);
    }

    // Initial render
    renderAnalysis();

});
