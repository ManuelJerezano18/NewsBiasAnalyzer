import nltk  # type: ignore
import newspaper  # type: ignore
from newspaper import Article  # type: ignore

# Add the path where nltk data is stored
nltk.data.path.append('.scraping/nltk_data')

# Function to scrape an article and return relevant information
def scrape_article(url):
    # Create an article object from the URL
    article = Article(url)

    # Download and parse the article
    article.download()
    article.parse()

    # Collecting article information
    article_info = {
        'authors': article.authors,
        'publish_date': article.publish_date,
        'text': article.text,
        'top_image': article.top_image
    }

    # Perform NLP operations (for keywords and summary)
    article.nlp()
    article_info['keywords'] = article.keywords
    article_info['summary'] = article.summary

    return article_info

