
# News Bias Check

The News Article Bias Analyzer is a web-based tool designed to help users critically evaluate the political and ideological biases present in news articles. Utilizing natural language processing (NLP) and machine learning techniques, the application provides a bias score and visualizes where an article falls on the political spectrum, aiming to improve media literacy and encourage more balanced information consumption.


## Features

- Article Submission for Bias Analysis: Users can submit a news article either by pasting the URL or the content of the article itself.
- Bias Detection: Using NLP and machine learning, the system analyzes the article and provides a bias score.
- Bias Score Visualization: Visual representation of the article's bias on a political spectrum.
- Article Comparison: Compare articles from different sources on the same topic for bias variation.
- Real-time News Scraping: Fetch articles and analyze their bias in real-time.
- User Accounts (future): Track the history of analyzed articles and share reports.
- Responsive Design: Optimized for both desktop and mobile browsers.


## Usage

- Submit an Article: Paste the URL or text of the news article into the provided input field on the homepage.
- Analyze Bias: The system will process the article, display a bias score, and visualize where the article falls on the political spectrum.
- Compare Articles: Use the comparison tool to analyze bias between different articles on similar topics from various sources.
- Visualize Results: Review the results of bias analysis through interactive graphs and visualizations.



## Authors

- [@Manuel Jerezano](https://github.com/ManuelJerezano18)
- [@Gleb Tebaykin](https://github.com/pudjojotaro)


## Documentation

[Documentation](https://docs.google.com/document/d/18W6HoGmePzOKZdarCt5vTo_xAROQptDB/edit)


## Tech Stack

**Backend:** 
- Python
- Flask or Django (for API and backend logic)
- NLP Libraries: spaCy, Transformers, or Hugging Face models for bias detection.
- Web Scraping: BeautifulSoup or Scrapy for fetching and parsing news articles.

**Frontend:** 
- React.js (for dynamic, interactive user interface)
- HTML5/CSS3/JavaScript
- Chart.js or D3.js for data visualizations.

**Database**
- SQLite (for development and testing)
- PostgreSQL or MongoDB (for production data storage)

**Others**
- Docker (for containerized deployment)
- AWS (for hosting)