document.addEventListener('DOMContentLoaded', function () {
    const articleContainer = document.getElementById('article-container');
    const toggleButton = document.getElementById('toggleModelButton');
    const downloadPdfButton = document.getElementById('downloadPdfButton');
    const downloadTxtButton = document.getElementById('downloadTxtButton');
    const articleText = localStorage.getItem('articleText');
    const hfBiasAnalysis = JSON.parse(localStorage.getItem('biasAnalysisResult'));
    const gptAnalysisResults = localStorage.getItem('gptAnalysisResults');
    const geminiAnalysisResults = localStorage.getItem('geminiAnalysisResults');
    const userEmail = localStorage.getItem('userEmail') || 'Unknown';
    const articleURL = localStorage.getItem('articleURL') || 'N/A';
    let currentModel = 'huggingface';

    // Chart.js initialization variables
    const biasBarChartCanvas = document.createElement('canvas');
    biasBarChartCanvas.id = 'biasBarChart';
    biasBarChartCanvas.style.display = 'none';
    biasBarChartCanvas.style.width = '400px'; // Smaller width
    biasBarChartCanvas.style.height = '200px'; // Smaller height
    articleContainer.appendChild(biasBarChartCanvas);

    toggleButton.addEventListener('click', () => {
        if (currentModel === 'huggingface') {
            currentModel = 'gpt4mini';
            toggleButton.textContent = 'Switch to Gemini Flash';
            renderBiasBarChart(); // Render the graph when switching to GPT-4 Mini
        } else if (currentModel === 'gpt4mini') {
            currentModel = 'gemini';
            toggleButton.textContent = 'Switch to Hugging Face';
            biasBarChartCanvas.style.display = 'none'; // Hide the graph
        } else {
            currentModel = 'huggingface';
            toggleButton.textContent = 'Switch to GPT-4 Mini';
            biasBarChartCanvas.style.display = 'none'; // Hide the graph
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

    function renderBiasBarChart() {
        biasBarChartCanvas.style.display = 'block';

        new Chart(biasBarChartCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Biased', 'Non-Biased'],
                datasets: [{
                    label: 'Bias Analysis',
                    data: [85, 15], // Placeholder data
                    backgroundColor: ['#FF6384', '#36A2EB'],
                    borderColor: ['#FF6384', '#36A2EB'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
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

        renderBiasBarChart(); // Render the chart in GPT-4 Mini mode
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
        const reportContent = generateReportContent(); // Use the same content generator
        createPdf(reportContent); // Generate and download the PDF
    });

    downloadTxtButton.addEventListener('click', () => {
        const reportContent = generateReportContent();
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Report_${userEmail}.txt`;
        link.click();
    });

    function generateReportContent() {
        return `
        Article Analysis Report

        User Email: ${userEmail}
        Article URL: ${articleURL}

        Analysis Model: ${currentModel.toUpperCase()}

        Article Text: ${articleText}

        Analysis Results:
        ${currentModel === 'huggingface' ? JSON.stringify(hfBiasAnalysis, null, 2) :
        currentModel === 'gpt4mini' ? gptAnalysisResults : geminiAnalysisResults}
        `;
    }

    async function createPdf(reportContent) {
        const docDefinition = {
            content: [
                { text: 'Article Analysis Report', style: 'header' },
                { text: '\nReport Details:', style: 'subheader' },
                { text: reportContent, style: 'body' },
                '\n',
            ],
            styles: {
                header: { fontSize: 18, bold: true, marginBottom: 10 },
                subheader: { fontSize: 14, bold: true, marginTop: 10 },
                body: { fontSize: 12 },
            },
        };
    
        const chartElement = document.getElementById('biasBarChart');
    
        if (chartElement) {
            try {
                const canvas = await html2canvas(chartElement);
                const imageData = canvas.toDataURL('image/png');
                docDefinition.content.push({
                    image: imageData,
                    width: 500, // Adjust the width of the graph in the PDF
                });
            } catch (error) {
                console.error('Error capturing graph image for PDF:', error);
            }
        }
    
        pdfMake.createPdf(docDefinition).download('bias-analysis-report.pdf');
    }
    // Initial render
    renderAnalysis();
});
