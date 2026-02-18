import feedparser
import requests
import trafilatura
import spacy
import asyncio
import hashlib
import json
import os
from bs4 import BeautifulSoup
from urllib.parse import quote_plus, urlparse, urlunparse
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime, timezone
from playwright.async_api import async_playwright

# =====================================================
# CONFIG
# =====================================================

RSS_FEEDS = [
    "https://www.thehindu.com/news/national/feeder/default.rss",
    "https://www.ptinews.com/rss/pti.xml",
    "https://ddnews.gov.in/rss.xml",
    "https://indianexpress.com/feed/",
    "https://scroll.in/feed",
    "https://thewire.in/rss",
    "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
    "https://www.republicworld.com/rss"
]

SIMILARITY_THRESHOLD = 0.55

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

INPUT_FILE = os.path.join(DATA_DIR, "raw_news_indian.json")
OUTPUT_FILE = os.path.join(DATA_DIR, "Similar_Links_Output.json")


# Load models once
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer("all-MiniLM-L6-v2")

# =====================================================
# UTILITIES
# =====================================================

def normalize_url(url):
    parsed = urlparse(url)
    return urlunparse(
        (parsed.scheme, parsed.netloc.replace("www.", ""), parsed.path, "", "", "")
    )

def hash_url(url):
    return hashlib.md5(normalize_url(url).encode()).hexdigest()

# =====================================================
# ARTICLE EXTRACTION
# =====================================================

def extract_article(url):
    downloaded = trafilatura.fetch_url(url)
    return trafilatura.extract(downloaded) or ""

def extract_event(text):
    return text[:800]

# def extract_event(text):
#     doc = nlp(text)

#     entities = [ent.text for ent in doc.ents if ent.label_ in 
#                 ["PERSON", "ORG", "GPE", "EVENT"]]

#     keywords = list(set(entities))

#     if keywords:
#         return " ".join(keywords[:8])  # keep query short
#     else:
#         return text[:300]  # fallback

# =====================================================
# FETCH SOURCES
# =====================================================

def fetch_rss():
    articles = []
    for rss in RSS_FEEDS:
        feed = feedparser.parse(rss)
        for entry in feed.entries:
            articles.append({
                "title": entry.get("title", ""),
                "description": entry.get("summary", ""),
                "url": entry.get("link", ""),
                "source": rss
            })
    return articles

def fetch_google_news(query):
    encoded = quote_plus(query)
    # rss = f"https://news.google.com/rss/search?q={encoded}&hl=en-US&gl=US&ceid=US:en"
    rss = f"https://news.google.com/rss/search?q={encoded}&hl=en-IN&gl=IN&ceid=IN:en"
    feed = feedparser.parse(rss)

    articles = []
    # for entry in feed.entries[:15]:
    for entry in feed.entries[:30]:
        articles.append({
            "title": entry.title,
            "description": entry.get("summary", ""),
            "url": entry.link,
            "source": "Google News"
        })
    return articles

# =====================================================
# SEMANTIC FILTER
# =====================================================

def semantic_filter(event_text, candidates):
    event_embedding = model.encode(event_text)
    matched = []

    for article in candidates:
        text = article["title"] + " " + article["description"]
        if not text.strip():
            continue

        article_embedding = model.encode(text)
        score = cosine_similarity([event_embedding], [article_embedding])[0][0]

        if score >= SIMILARITY_THRESHOLD:
            article["similarity_score"] = round(float(score), 3)
            matched.append(article)

    return sorted(matched, key=lambda x: x["similarity_score"], reverse=True)[:7]

# =====================================================
# CANONICAL + PUBLISHER
# =====================================================

def get_canonical_url(url):
    try:
        r = requests.get(url, timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
        tag = soup.find("link", rel="canonical")
        if tag and tag.get("href"):
            return normalize_url(tag["href"])
    except:
        pass
    return normalize_url(url)

def extract_publisher(url):
    domain = urlparse(url).netloc.replace("www.", "")
    return domain.split(".")[0].title()

# =====================================================
# GOOGLE REDIRECT RESOLVE
# =====================================================

async def resolve_google(page, url):
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=10000)
        await page.wait_for_timeout(2000)
        final = page.url
        if "news.google.com" in final:
            return None
        return final
    except:
        return None

# =====================================================
# PROCESS SINGLE ARTICLE
# =====================================================

async def process_article(input_url):

    text = extract_article(input_url)
    if not text:
        return None

    event_text = extract_event(text)

    candidates = []
    candidates.extend(fetch_google_news(event_text))
    candidates.extend(fetch_rss())

    # Remove duplicates
    seen = set()
    unique = []
    for c in candidates:
        h = hash_url(c["url"])
        if h not in seen:
            seen.add(h)
            unique.append(c)

    matched = semantic_filter(event_text, unique)

    # Made Changes
    if not matched:
        title_query = text.split(".")[0][:150]
        candidates = fetch_google_news(title_query)
        matched = semantic_filter(title_query, candidates)
    # Changes Ended

    input_canonical = get_canonical_url(input_url)
    input_source = extract_publisher(input_url)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()

        final_reports = []

        for r in matched:

            if r["source"] == "Google News":
                page = await context.new_page()
                resolved = await resolve_google(page, r["url"])
                await page.close()
                if not resolved:
                    continue
                r["url"] = resolved

            canonical = get_canonical_url(r["url"])
            source = extract_publisher(r["url"])

            if canonical == input_canonical:
                continue

            if source.lower() == input_source.lower():
                continue

            r["source_name"] = source
            r.pop("source", None)
            final_reports.append(r)

        await browser.close()

    return {
        "input_article": {
            "url": input_url,
            "source_name": input_source
        },
        "related_reports": final_reports
    }

# =====================================================
# MAIN (SAVE ONE BY ONE + FIXED JSON HANDLING)
# =====================================================

async def main():

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
     raw_data = json.load(f)


    # Safe extraction of URLs
    input_urls = []

    if isinstance(raw_data, list):
        for item in raw_data:
            if isinstance(item, str):
                input_urls.append(item)
            elif isinstance(item, dict):
                url = item.get("url") or item.get("link")
                if isinstance(url, str):
                    input_urls.append(url)

    elif isinstance(raw_data, dict):
        possible_list = raw_data.get("results") or raw_data.get("urls")
        if isinstance(possible_list, list):
            for item in possible_list:
                if isinstance(item, str):
                    input_urls.append(item)
                elif isinstance(item, dict):
                    url = item.get("url") or item.get("link")
                    if isinstance(url, str):
                        input_urls.append(url)

    # Initialize output file if not exists
    if not os.path.exists(OUTPUT_FILE):
     with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump({
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "results": [],
            "failed_urls": []
        }, f, indent=2)

    # Resume support
    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        saved = json.load(f)

    results = saved.get("results", [])
    processed = {
        normalize_url(r["input_article"]["url"])
        for r in results
        if isinstance(r, dict)
    }


    # Process one by one
    for url in input_urls:

        if not isinstance(url, str):
            continue

        if normalize_url(url) in processed:

            continue

        print("Processing:", url)

        try:
            result = await process_article(url)
            if result:
                results.append(result)

                with open(OUTPUT_FILE, "r+", encoding="utf-8") as f:
                    data = json.load(f)
                    data["results"].append(result)
                    data["generated_at"] = datetime.now(timezone.utc).isoformat()
                    f.seek(0)
                    json.dump(data, f, indent=2, ensure_ascii=False)
                    f.truncate()


                print("Saved")

        except Exception as e:
            print("Error:", e)

    print("Finished")

# =====================================================
# RUN
# =====================================================

if __name__ == "__main__":
    asyncio.run(main())
