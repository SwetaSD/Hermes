import json
import os
import requests
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer, util

# ==================================================
# PATHS
# ==================================================

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(BASE_DIR, "data")

INPUT_FILE = os.path.join(DATA_DIR, "Similar_Links_Output.json")
OUTPUT_FILE = os.path.join(DATA_DIR, "classified_news.json")

# ==================================================
# LOAD MODEL
# ==================================================

model = SentenceTransformer("all-MiniLM-L6-v2")

# ==================================================
# IMAGE EXTRACTOR (STRONG VERSION)
# ==================================================

def extract_image_url(url):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        r = requests.get(url, headers=headers, timeout=10)

        soup = BeautifulSoup(r.text, "html.parser")

        # Open Graph
        og = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
        if og and og.get("content"):
            return og["content"]

        # Twitter
        tw = soup.find("meta", property="twitter:image")
        if tw and tw.get("content"):
            return tw["content"]

        # Fallback img
        img = soup.find("img")
        if img:
            return img.get("data-src") or img.get("src")

    except Exception as e:
        print("Image fetch error:", e)

    return None

# ==================================================
# REFERENCE TEXTS
# ==================================================

POLITICAL_TEXTS = [
    "government policy decision",
    "state or central government announcement",
    "election, voting, political parties",
    "chief minister or prime minister statement",
    "parliament or assembly decision",
    "public welfare scheme by government",
    "law, bill, or policy implementation",
    "political appointments or resignations"
]

NON_POLITICAL_TEXTS = [
    "road accident or crime report",
    "sports match result",
    "celebrity news or entertainment",
    "health tips or lifestyle article",
    "technology or science discovery",
    "weather update",
    "business earnings report"
]

political_embeddings = model.encode(POLITICAL_TEXTS, convert_to_tensor=True)
non_political_embeddings = model.encode(NON_POLITICAL_TEXTS, convert_to_tensor=True)

# ==================================================
# CLASSIFIER
# ==================================================

def classify_news(text, margin=0.05):
    if not text or not text.strip():
        return "non_political"

    emb = model.encode(text, convert_to_tensor=True)
    p = util.cos_sim(emb, political_embeddings).max().item()
    n = util.cos_sim(emb, non_political_embeddings).max().item()

    return "political" if p >= n + margin else "non_political"

# ==================================================
# MAIN PROCESSING
# ==================================================

def process_event(input_file, output_file):

    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file not found: {input_file}")

    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # ==================================================
    # MODIFY EXISTING STRUCTURE ONLY (NO REBUILD)
    # ==================================================

    for item in data.get("results", []):

        combined_text_parts = []

        # ============================
        # RELATED REPORTS (KEEP IMAGE LOGIC)
        # ============================
        reports = item.get("related_reports", [])

        for r in reports:

            title = r.get("title", "")
            desc = r.get("description", "")
            url = r.get("url")

            if title:
                combined_text_parts.append(title)

            if desc:
                combined_text_parts.append(desc)

            # ✅ YOUR ORIGINAL IMAGE LOGIC (UNCHANGED)
            image_url = r.get("image_url")

            if not image_url and url:
                image_url = extract_image_url(url)

            if image_url:
                r["image_url"] = image_url

        # ============================
        # INPUT ARTICLE (KEEP IMAGE LOGIC)
        # ============================
        main_article = item.get("input_article", {})
        main_url = main_article.get("url")

        main_image = main_article.get("image_url")

        if not main_image and main_url:
            main_image = extract_image_url(main_url)

        if main_image:
            main_article["image_url"] = main_image

        # classification text
        if main_article.get("title"):
            combined_text_parts.append(main_article["title"])

        if main_article.get("summary"):
            combined_text_parts.append(main_article["summary"])

        # ============================
        # CLASSIFICATION
        # ============================
        combined_text = " ".join(combined_text_parts)

        category = classify_news(combined_text)

        # ✅ ADD ONLY NEW FIELD
        item["category"] = category

    # ==================================================
    # SAVE SAME JSON STRUCTURE
    # ==================================================

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("[DONE] Structure retained | Image logic preserved")
    print(f"[OUTPUT] {output_file}")

    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file not found: {input_file}")

    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # ==================================================
    # LOOP THROUGH EXISTING STRUCTURE (NO REBUILDING)
    # ==================================================

    for item in data.get("results", []):

        reports = item.get("related_reports", [])
        combined_text_parts = []

        # ============================
        # RELATED REPORTS PROCESSING
        # ============================
        for r in reports:
            title = r.get("title", "")
            desc = r.get("description", "")
            url = r.get("url")

            if title:
                combined_text_parts.append(title)
            if desc:
                combined_text_parts.append(desc)

            # ✅ ADD IMAGE URL IF MISSING
            if not r.get("image_url") and url:
                r["image_url"] = extract_image_url(url)

        # ============================
        # INPUT ARTICLE PROCESSING
        # ============================
        main_article = item.get("input_article", {})
        main_url = main_article.get("url")

        if not main_article.get("image_url") and main_url:
            main_article["image_url"] = extract_image_url(main_url)

        # Include main article text for classification
        if main_article.get("title"):
            combined_text_parts.append(main_article["title"])

        if main_article.get("summary"):
            combined_text_parts.append(main_article["summary"])

        # ============================
        # CLASSIFICATION
        # ============================
        combined_text = " ".join(combined_text_parts)
        category = classify_news(combined_text)

        # ✅ ADD CATEGORY TO SAME OBJECT
        item["category"] = category

    # ==================================================
    # SAVE SAME STRUCTURE BACK
    # ==================================================

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("[DONE] Structure preserved and enriched")
    print(f"[OUTPUT] {output_file}")

# ==================================================
# RUN
# ==================================================

if __name__ == "__main__":
    process_event(INPUT_FILE, OUTPUT_FILE)