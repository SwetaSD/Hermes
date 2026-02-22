from flask import Flask, jsonify
import os
import sys
sys.path.insert(0, os.path.join(os.path.abspath(os.path.dirname(__file__)), "start_pipeline"))
from raw_news import fetch_and_store_news

app = Flask(__name__)

# ROUTES

@app.route("/")
def home():
    return "Flask is Running"


@app.route("/raw-news/sync", methods=["POST"])
def fetch_and_store():
    result = fetch_and_store_news()
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result)



# @app.route("/results/raw_news")
# def get_raw_news():
#     return jsonify(load_json("raw_news_indian.json"))


# @app.route("/results/similar_links")
# def get_similar_links():
#     return jsonify(load_json("Similar_Links_Output.json"))



# @app.route("/results/classified_news")
# def get_classified_news():
#     return jsonify(load_json("classified_news.json"))


# @app.route("/results/final_results")
# def get_final_results():
#     return jsonify(load_json("classified_results.json"))


# MAIN ENTRY

if __name__ == "__main__":
    print("Flask starting...")

    app.run(
        debug=False,        # no watchdog
        use_reloader=False  # critical on Windows
    )
