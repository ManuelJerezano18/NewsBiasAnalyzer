document.addEventListener('DOMContentLoaded', function() {
    const articleContainer = document.getElementById('article-container');
    const toggleButton = document.getElementById('toggleModelButton');
    const downloadPdfButton = document.getElementById('downloadPdfButton');
    const downloadTxtButton = document.getElementById('downloadTxtButton');
    const articleText = localStorage.getItem('articleText');
    const hfBiasAnalysis = JSON.parse(localStorage.getItem('biasAnalysisResults'));
    const gptAnalysisResults = localStorage.getItem('gptAnalysisResults');
    const geminiAnalysisResults = localStorage.getItem('geminiAnalysisResults');
    let currentModel = 'huggingface';

    toggleButton.addEventListener('click', () => {
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
        renderAnalysis();
    });

    function renderAnalysis() {
        articleContainer.textContent = ''; // Clear previous content
        if (currentModel === 'huggingface') {
            displayHuggingFaceAnalysis();
        } else if (currentModel === 'gpt4mini') {
            displayGPT4MiniAnalysis();
        } else if (currentModel === 'gemini') {
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
    }

    function displayGPT4MiniAnalysis() {
        articleContainer.textContent = '';
        const articleWrapper = document.createElement('div');
        articleWrapper.className = 'article-wrapper';

        const articleDiv = document.createElement('div');
        articleDiv.className = 'article-text';
        articleDiv.textContent = articleText;

        const analysisDiv = document.createElement('div');
        analysisDiv.className = 'analysis-div';
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

        const analysisDiv = document.createElement('div');
        analysisDiv.className = 'analysis-div';
        analysisDiv.textContent = `Gemini Bias Analysis: ${geminiAnalysisResults}`;

        articleWrapper.appendChild(articleDiv);
        articleWrapper.appendChild(analysisDiv);
        articleContainer.appendChild(articleWrapper);
    }

    // Report download functionality
    downloadPdfButton.addEventListener('click', () => {
        const reportContent = generateReportContent();
        createPdf(reportContent);
    });

    downloadTxtButton.addEventListener('click', () => {
        const reportContent = generateReportContent();
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'bias-analysis-report.txt';
        link.click();
    });

    function generateReportContent() {
        return `
        Article Analysis Report

        Analysis Model: ${currentModel.toUpperCase()}
        Article Excerpt: ${articleText.substring(0, 200)}... [truncated]

        Analysis Results:
        ${currentModel === 'huggingface' ? JSON.stringify(hfBiasAnalysis, null, 2) :
        currentModel === 'gpt4mini' ? gptAnalysisResults : geminiAnalysisResults}
        `;
    }

    function createPdf(content) {
        const docDefinition = {
            content: [
                { text: 'Article Analysis Report', style: 'header' },
                { text: content, style: 'body' }
            ],
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
                body: { fontSize: 12, margin: [0, 0, 0, 10] }
            }
        };
        pdfMake.createPdf(docDefinition).download('bias-analysis-report.pdf');
    }

    // Initial render
    renderAnalysis();
});
