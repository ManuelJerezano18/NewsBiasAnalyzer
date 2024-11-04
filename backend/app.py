import nltk  # type: ignore
import flask # type: ignore
from flask import Flask, request, jsonify # type: ignore
import newspaper  # type: ignore
from newspaper import Article  # type: ignore
from flask_cors import CORS # type: ignore
import openai  # type: ignore
import dotenv # type: ignore
from dotenv import load_dotenv # type: ignore
from openai import OpenAI # type: ignore
import google.generativeai as genai # type: ignore
from google.cloud import aiplatform
import os

load_dotenv()
client = OpenAI()
openai.api_key = os.getenv("OPENAI_API_KEY")

genai.configure(api_key=os.getenv("GENAI_API_KEY"))

# Add the path where nltk data is stored
#nltk.data.path.append('.scraping/nltk_data')

#nltk.data.path.append('/home/ubuntu/scraping/nltk_data')  # Modify to the full path where nltk_data is located
###print("NLTK data paths:", nltk.data.path)
nltk.download('punkt')
nltk.download('punkt_tab')

app = Flask(__name__)

CORS(app, resources={r"/scrape": {"origins": "http://127.0.0.1:5500"}})
CORS(app, resources={r"/analyze_bias_gpt4mini": {"origins": "http://127.0.0.1:5500"}})
CORS(app, resources={r"/analyze_bias_gemini": {"origins": "http://127.0.0.1:5500"}})

def analyze_with_gemini_flash(article_text):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            "You are an advanced text analyst with a keen understanding of media bias and rhetoric. You have spent the last 15 years developing algorithms and methodologies to evaluate the objectivity of news articles across various genres and formats. Your expertise allows you to dissect language, tone, and framing techniques to deliver reliable bias assessments.Your task is to analyze a provided news article for bias. Please consider the specific language used, the framing of facts, the presence of subjective opinions, and the overall tone of the article in your analysis. You will be given the details of the article you need to evaluate. While analyzing, please keep in mind the following criteria: identify any emotionally charged language, potential omissions of important facts, the balance of perspectives presented, and any other indicators of bias. Provide only the percentage of bias that accurately reflects your assessment, nothing else."
            "Please provide only the bias rating from 0% (completely neutral) "
            "to 100% (highly biased).\n\n"
            f"Text:\n{article_text}"
        )

        response = model.generate_content(prompt)
        # Extract the response text
        result = response.text
        print("Gemini Flash analysis result:", result)
        return result

    except Exception as e:
        print(f"Error in Gemini Flash analysis: {e}")
        return None

# Define the endpoint
@app.route('/analyze_bias_gemini', methods=['POST'])
def analyze_bias_gemini():
    try:
        article_text = request.json.get('text')
        if not article_text:
            return jsonify({"error": "No text provided for analysis"}), 400

        analysis_result = analyze_with_gemini_flash(article_text)
        if analysis_result is None:
            return jsonify({"error": "Failed to analyze text"}), 500

        return jsonify({"bias_analysis": analysis_result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def analyze_with_gpt4mini(article_text):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Use GPT-4 model
            messages= [
                { "role": "system", "content": "You are an advanced text analyst with a keen understanding of media bias and rhetoric. You have spent the last 15 years developing algorithms and methodologies to evaluate the objectivity of news articles across various genres and formats. Your expertise allows you to dissect language, tone, and framing techniques to deliver reliable bias assessments.Your task is to analyze a provided news article for bias. Please consider the specific language used, the framing of facts, the presence of subjective opinions, and the overall tone of the article in your analysis. You will be given the details of the article you need to evaluate. While analyzing, please keep in mind the following criteria: identify any emotionally charged language, potential omissions of important facts, the balance of perspectives presented, and any other indicators of bias. Provide only the percentage of bias that accurately reflects your assessment, nothing else." },
                {"role": "user", "content": f"Analyze the following article for bias:\n\n{article_text}"}
            ],
            max_tokens=1500  # Adjust based on your needs
        )
        result = response.choices[0].message.content
        return result
    except Exception as e:
        print(f"Error in GPT-4 Mini analysis: {e}")
        return None

@app.route('/analyze_bias_gpt4mini', methods=['POST'])
def analyze_bias():
    try:
        # Expect a JSON request with 'text' key for the article content to analyze
        article_text = request.json.get('text')
        
        if not article_text:
            return jsonify({"error": "No text provided for analysis"}), 400

        # Call the GPT-4 Mini analysis function
        gpt4mini_analysis = analyze_with_gpt4mini(article_text)
        print("GPT-4 Mini analysis result:", gpt4mini_analysis)
        # Return the analysis result
        return jsonify({"bias_analysis": gpt4mini_analysis}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



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
    app.run(host='0.0.0.0', port=5000)