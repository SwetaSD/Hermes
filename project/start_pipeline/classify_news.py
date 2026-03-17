import json
import os
from sentence_transformers import SentenceTransformer, util

# ==================================================
# PATHS (FIXED)
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
# REFERENCE MEANINGS
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

    output = []
    news_counter = 1

    for item in data.get("results", []):

        reports = item.get("related_reports", [])
        combined_text_parts = []
        source_map = {}

        # ----------------------------
        # CASE 1: Related reports exist
        # ----------------------------
        if reports:
            for r in reports:
                title = r.get("title", "")
                desc = r.get("description", "")

                if title:
                    combined_text_parts.append(title)
                if desc:
                    combined_text_parts.append(desc)

                source = r.get("source_name", "Unknown")
                url = r.get("url")

                if source and url and source not in source_map:
                    source_map[source] = {
                        "source": source,
                        "url": url
                    }

        # ----------------------------
        # CASE 2: No related reports
        # ----------------------------
        else:
            main = item.get("input_article", {})
            if main.get("url"):
                combined_text_parts.append(main.get("url"))

        combined_text = " ".join(combined_text_parts)

        category = classify_news(combined_text)

        news_entry = {
            "news_id": news_counter,
            "main_news": {
                "url": item.get("input_article", {}).get("url", "Unknown"),
                "source": item.get("input_article", {}).get("source_name", "Unknown")
            },
            "category": category
        }

        if source_map:
            news_entry["references"] = list(source_map.values())

        output.append(news_entry)
        news_counter += 1

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump({"classified_news": output}, f, indent=2, ensure_ascii=False)

    print(f"[DONE] Classified {news_counter - 1} news items")
    print(f"[OUTPUT] {output_file}")

# ==================================================
# RUN
# ==================================================

if __name__ == "__main__":
    process_event(INPUT_FILE, OUTPUT_FILE)
