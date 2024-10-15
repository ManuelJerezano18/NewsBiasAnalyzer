import nltk  # type: ignore
import flask # type: ignore
from flask import Flask, request, jsonify # type: ignore
import newspaper  # type: ignore
from newspaper import Article  # type: ignore
from flask_cors import CORS # type: ignore

# Add the path where nltk data is stored
nltk.data.path.append('.scraping/nltk_data')

app = Flask(__name__)

CORS(app, resources={r"/scrape": {"origins": "http://127.0.0.1:5500"}})

@app.route('/scrape', methods=['POST'])
def scrape_article():
    try:
        url = request.json.get('url')  # Get the URL from the request
        article = Article(url)
        article.download()
        article.parse()
        article.nlp()  # Perform NLP operations for keywords and summary

        # Return the scraped data
        article_info = {
            'authors': article.authors,
            'publish_date': article.publish_date,
            'text': article.text,
            'top_image': article.top_image,
            'keywords': article.keywords,
            'summary': article.summary
        }
        return jsonify(article_info), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
