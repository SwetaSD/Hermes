import feedparser
import sys
import os
from datetime import datetime
from rss_sources_indian import INDIAN_NEWS_SOURCES

# Allow importing supabase_client from the project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from supabase_client import supabase


def fetch_rss_feeds(existing_guids=None):
    if existing_guids is None:
        existing_guids = set()

    new_articles = []

    for source in INDIAN_NEWS_SOURCES:
        feed = feedparser.parse(source["rss"])

        for entry in feed.entries:
            guid = entry.get("id", entry.get("link"))
            if guid in existing_guids:
                continue

            article = {
                "title": entry.get("title"),
                "normalizedTitle": entry.get("title", "").lower(),
                "link": entry.get("link"),
                "source": source["name"],
                "bias": source["bias"],
                "publishedAt": entry.get("published", ""),
                "guid": guid,
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }

            new_articles.append(article)
            existing_guids.add(guid)

    return new_articles


def fetch_and_store_news():
    try:

        existing = supabase.table("raw_news").select("guid").execute()
        existing_guids = {row["guid"] for row in existing.data}

        new_articles = fetch_rss_feeds(existing_guids)

        if not new_articles:
            return {"message": "No new articles found", "inserted": 0}
        rows = []
        for a in new_articles:
            rows.append({
                "title": a["title"],
                "normalized_title": a["normalizedTitle"],
                "link": a["link"],
                "source": a["source"],
                "bias": a["bias"],
                "published_at": a["publishedAt"],
                "guid": a["guid"],
                "updated_at": a["updatedAt"],
            })

        batch_size = 500
        inserted = 0
        for i in range(0, len(rows), batch_size):
            batch = rows[i : i + batch_size]
            supabase.table("raw_news").insert(batch).execute()
            inserted += len(batch)

        return {"message": "Articles stored successfully", "inserted": inserted}

    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    result = fetch_and_store_news()
    print(result)