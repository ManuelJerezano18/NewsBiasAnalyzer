document.addEventListener('DOMContentLoaded', function() {
    const articleContainer = document.getElementById('article-container');
    const analysisContainer = document.getElementById('analysis-container');
    
    // Retrieve data from localStorage
    const articleText = localStorage.getItem('articleText');
    const biasAnalysis = JSON.parse(localStorage.getItem('biasAnalysisResult'));

    if (articleText && biasAnalysis) {
        const windowSize = 500;  // Same window size used in the API
        const overlap = 50;
        let start = 0;

        // Create chunks based on the window size and overlap used in analysis
        while (start < articleText.length) {
            let chunk;

            // For the first chunk, take the full window size, and for subsequent chunks,
            // remove the first "window" characters from the previous chunk.
            if (start === 0) {
                chunk = articleText.slice(start, start + windowSize).trim();
            } else {
                chunk = articleText.slice(start + overlap, start + windowSize).trim();
            }

            // Calculate the index in biasAnalysis based on the chunk position
            const biasResultIndex = Math.floor(start / (windowSize - overlap));
            const biasResult = biasAnalysis[biasResultIndex];

            // Create wrapper div for each chunk
            const chunkWrapper = document.createElement('div');
            chunkWrapper.className = 'chunk-wrapper';

            // Create the curly brace element
            const chunkBrace = document.createElement('div');
            chunkBrace.className = 'chunk-brace';
            chunkBrace.textContent = '⎰';  // Unicode curly brace

            // Create div for the article chunk
            const chunkDiv = document.createElement('div');
            chunkDiv.className = 'chunk-text';
            chunkDiv.textContent = chunk;

            // Create the div for bias analysis
            const biasDiv = document.createElement('div');
            biasDiv.className = 'bias-analysis';

            if (biasResult && biasResult[0]) {
                // Loop through bias result and append each label and score
                biasResult[0].forEach(result => {
                    const labelDiv = document.createElement('div');
                    labelDiv.className = `label ${result.label === "Biased" ? "biased" : "non-biased"}`;
                    labelDiv.textContent = `${result.label}: ${(result.score * 100).toFixed(2)}%`;
                    biasDiv.appendChild(labelDiv);
                });
            } else {
                biasDiv.textContent = "No analysis available for this chunk";
            }

            // Append curly brace, chunk text, and bias result to the wrapper
            chunkWrapper.appendChild(chunkBrace);
            chunkWrapper.appendChild(chunkDiv);
            chunkWrapper.appendChild(biasDiv);

            // Append the wrapper to the main container
            articleContainer.appendChild(chunkWrapper);

            // Move the window forward
            start += windowSize - overlap;
        }
    } else {
        articleContainer.textContent = 'No article text found.';
        analysisContainer.textContent = 'No analysis results found.';
    }
});
