document.addEventListener('DOMContentLoaded', function() {
    const articleContainer = document.getElementById('article-container');
    const analysisContainer = document.getElementById('analysis-container');
    const toggleButton = document.getElementById('toggleModelButton');
    const articleText = localStorage.getItem('articleText');
    const hfBiasAnalysis = JSON.parse(localStorage.getItem('biasAnalysisResult'));
    const gptAnalysisResults = localStorage.getItem('gptAnalysisResults'); // Stored as plain text

    let currentModel = 'huggingface';

    toggleButton.addEventListener('click', () => {
        currentModel = currentModel === 'huggingface' ? 'gpt4mini' : 'huggingface';
        toggleButton.textContent = currentModel === 'huggingface' ? 'Switch to GPT-4 Mini' : 'Switch to Hugging Face';
        renderAnalysis();
    });

    function renderAnalysis() {
        articleContainer.innerHTML = '';  // Clear previous content

        if (currentModel === 'huggingface') {
            renderHuggingFaceAnalysis();
        } else {
            renderGpt4MiniAnalysis();
        }
    }

    function renderHuggingFaceAnalysis() {
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
    }

    function renderGpt4MiniAnalysis() {
        articleContainer.textContent = '';
        const articleWrapper = document.createElement('div');
        articleWrapper.className = 'article-wrapper';

        const articleDiv = document.createElement('div');
        articleDiv.className = 'article-text';
        articleDiv.textContent = articleText;

        const analysisDiv = document.createElement('div');
        analysisDiv.className = 'gpt4mini-analysis';
        analysisDiv.textContent = `GPT-4 Mini Bias Analysis: ${gptAnalysisResults}`;

        articleWrapper.appendChild(articleDiv);
        articleWrapper.appendChild(analysisDiv);
        articleContainer.appendChild(articleWrapper);
    }

    // Initial render
    renderAnalysis();

});
