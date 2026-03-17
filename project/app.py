from flask import Flask, jsonify
import subprocess
import uuid
import os
import json
import threading
import sys

app = Flask(__name__)

# -----------------------
# PATH CONFIG
# -----------------------
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PIPELINE_DIR = os.path.join(BASE_DIR, "start_pipeline")
DATA_DIR = os.path.join(BASE_DIR, "data")

os.makedirs(DATA_DIR, exist_ok=True)

PIPELINE_STATUS = {}


# -----------------------
# HELPERS
# -----------------------
def run_script(script_name):
    script_path = os.path.join(PIPELINE_DIR, script_name)

    if not os.path.exists(script_path):
        raise Exception(f"Script not found: {script_path}")

    print(f"▶ Running {script_name}")

    result = subprocess.run(
        [sys.executable, script_path],
        capture_output=True,
        text=True,
        cwd=BASE_DIR
    )

    if result.stdout:
        print(result.stdout)

    if result.returncode != 0:
        raise Exception(result.stderr or result.stdout)


def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return {"error": f"{filename} not found"}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# -----------------------
# PIPELINE LOGIC
# -----------------------
def pipeline_runner(run_id):
    try:
        PIPELINE_STATUS[run_id] = "rss_sources"
        run_script("rss_sources_indian.py")

        PIPELINE_STATUS[run_id] = "raw_news"
        run_script("fetch_news_indian.py")

        PIPELINE_STATUS[run_id] = "similar_links"
        run_script("Fetch_Similar_News.py")

        PIPELINE_STATUS[run_id] = "classification"
        run_script("classify_news.py")

        PIPELINE_STATUS[run_id] = "lcr_labeling"
        run_script("LCR_classified.py")

        PIPELINE_STATUS[run_id] = "completed"
        print("✅ Pipeline completed")

    except Exception as e:
        PIPELINE_STATUS[run_id] = f"failed: {str(e)}"
        print("❌ Pipeline failed")
        print(e)


# -----------------------
# ROUTES
# -----------------------
@app.route("/start_pipeline", methods=["POST"])
def start_pipeline():
    run_id = str(uuid.uuid4())
    PIPELINE_STATUS[run_id] = "started"

    threading.Thread(
        target=pipeline_runner,
        args=(run_id,),
        daemon=True
    ).start()

    return jsonify({"run_id": run_id, "status": "started"})


@app.route("/status/<run_id>")
def check_status(run_id):
    return jsonify({
        "run_id": run_id,
        "status": PIPELINE_STATUS.get(run_id, "invalid_run_id")
    })


@app.route("/results/raw_news")
def get_raw_news():
    return jsonify(load_json("raw_news_indian.json"))


@app.route("/results/similar_links")
def get_similar_links():
    return jsonify(load_json("Similar_Links_Output.json"))



@app.route("/results/classified_news")
def get_classified_news():
    return jsonify(load_json("classified_news.json"))


@app.route("/results/final_results")
def get_final_results():
    return jsonify(load_json("classified_results.json"))


@app.route("/")
def home():
    return "Flask News Pipeline is Running ✅"


# -----------------------
# MAIN ENTRY
# -----------------------
if __name__ == "__main__":
    print("🚀 Flask starting...")

    # Auto-start pipeline ONLY ONCE
    auto_run_id = str(uuid.uuid4())
    PIPELINE_STATUS[auto_run_id] = "auto_started"

    threading.Thread(
        target=pipeline_runner,
        args=(auto_run_id,),
        daemon=True
    ).start()

    # 🚨 IMPORTANT FIX
    app.run(
        debug=False,        # no watchdog
        use_reloader=False  # critical on Windows
    )
