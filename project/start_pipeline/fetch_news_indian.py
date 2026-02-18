import feedparser
import json
import os
from datetime import datetime
from rss_sources_indian import INDIAN_NEWS_SOURCES

os.makedirs("data", exist_ok=True)

output_file = "data/raw_news_indian.json"

# Load existing data if file exists
if os.path.exists(output_file):
    with open(output_file, "r", encoding="utf-8") as f:
        try:
            articles = json.load(f)
        except json.JSONDecodeError:
            articles = []
else:
    articles = []

seen_guids = {a.get("guid") for a in articles}

for source in INDIAN_NEWS_SOURCES:
    feed = feedparser.parse(source["rss"])

    for entry in feed.entries:
        guid = entry.get("id", entry.get("link"))
        if guid in seen_guids:
            continue

        article = {
            "title": entry.get("title"),
            "normalizedTitle": entry.get("title", "").lower(),
            "link": entry.get("link"),
            "source": source["name"],
            "bias": source["bias"],
            "publishedAt": entry.get("published", ""),
            "guid": guid,
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }

        articles.append(article)
        seen_guids.add(guid)

        # 🔥 write immediately
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(articles, f, indent=2, ensure_ascii=False)

print(f"Fetched {len(articles)} articles")
