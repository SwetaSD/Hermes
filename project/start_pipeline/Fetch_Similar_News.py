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
import ollama

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
CACHE_FILE = os.path.join(DATA_DIR, "publisher_cache.json")

# Load models once
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer("all-MiniLM-L6-v2")

# =====================================================
# AI SUMMARY — SINGLE ARTICLE
# =====================================================

def generate_article_summary(text):

    if not text or len(text) < 200:
        return None

    try:
        response = ollama.chat(
            model="llama3.2",
            messages=[
                {
                    "role": "system",
                    "content": "You summarize news articles factually."
                },
                {
                    "role": "user",
                    "content": f"""
Summarize this news article in 2–3 factual lines.
No opinions. Neutral journalistic tone.

{text[:4000]}
"""
                }
            ]
        )

        return clean_summary(
    response["message"]["content"].strip()
)

    except Exception as e:
        print("Summary error:", e)
        return None


# =====================================================
# AI SUMMARY — COMBINED STORY
# =====================================================

def generate_story_summary(main_text, related_texts):

    combined = main_text[:2500]

    for t in related_texts[:5]:   # limit sources
        combined += "\n\nSOURCE:\n" + t[:1200]

    try:
        response = ollama.chat(
            model="llama3.2",
            messages=[
                {
                    "role": "system",
                    "content": "You are a neutral news editor combining multiple reports."
                },
                {
                    "role": "user",
                    "content": f"""
Create a unified news summary in 3–4 lines combining all sources.
Remove repetition.
Stay factual and neutral.

{combined}
"""
                }
            ]
        )

        return clean_summary(
    response["message"]["content"].strip()
)

    except Exception as e:
        print("Story summary error:", e)
        return None

def clean_summary(text: str) -> str:
    if not text:
        return ""

    # remove unwanted starting phrases
    unwanted_prefixes = [
        "Here is a summary",
        "Here are",
        "Here is a unified",
        "Here is the summary",
        "Summary:",
        "Here’s",
    ]

    cleaned = text.strip()

    for phrase in unwanted_prefixes:
        if cleaned.lower().startswith(phrase.lower()):
            # remove first line completely
            cleaned = "\n".join(cleaned.split("\n")[1:]).strip()
            break

    return cleaned

# =========================
# CACHE
# =========================
def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Keep only domain → string mappings
        cleaned = {
            k: v for k, v in data.items()
            if isinstance(k, str) and isinstance(v, str)
        }

        return cleaned

    return {}


def save_cache(cache):
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)

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
        "source": rss,
        "publishedAt": entry.get("published", None)
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
        "source": "Google News",
        "publishedAt": entry.get("published", None)
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

    cache = load_cache()

    domain = urlparse(url).netloc.replace("www.", "")

    # If already cached → return directly
    if domain in cache:
        return cache[domain]

    # Otherwise generate publisher name
    publisher = domain.split(".")[0].replace("-", " ").title()

    # Save to cache
    cache[domain] = publisher
    save_cache(cache)

    return publisher


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

async def process_article(article_meta):

    input_url = article_meta["url"]
    input_title = article_meta.get("title")
    input_published = article_meta.get("publishedAt")
    cache = load_cache()
    
    text = extract_article(input_url)
    if not text:
        return None
    
    input_summary = generate_article_summary(text)
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
            
            # article_text = extract_article(r["url"])
            # r["summary"] = generate_article_summary(article_text)
            article_text = extract_article(r["url"])

            r["_full_text"] = article_text   # ← store temporarily
            r["summary"] = generate_article_summary(article_text)
            r["source_name"] = source
            r.pop("source", None)
            final_reports.append(r)

        await browser.close()

        # related_texts = []
        related_texts = [
    r["_full_text"]
    for r in final_reports
    if r.get("_full_text")
]

    for r in final_reports:
        txt = extract_article(r["url"])
        if txt:
            related_texts.append(txt)

    story_summary = generate_story_summary(text, related_texts)
    
    for r in final_reports:
        r.pop("_full_text", None)
    return {
    "input_article": {
        "url": input_url,
        "source_name": input_source,
        "title": input_title,
        "publishedAt": input_published,
        "summary": input_summary
    },
    "story_summary": story_summary,
    "related_reports": final_reports
}

# =====================================================
# MAIN (SAVE ONE BY ONE + FIXED JSON HANDLING)
# =====================================================

async def main():

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    # ===============================
    # FIX 1 — Preserve metadata
    # ===============================
    input_articles = []

    if isinstance(raw_data, list):
        for item in raw_data:
            if isinstance(item, dict):

                url = item.get("url") or item.get("link")

                if isinstance(url, str):
                    input_articles.append({
                        "url": url,
                        "title": item.get("title"),
                        "publishedAt": item.get("publishedAt"),
                        "source": item.get("source")
                    })

            elif isinstance(item, str):
                # fallback if raw list contains plain URLs
                input_articles.append({
                    "url": item,
                    "title": None,
                    "publishedAt": None,
                    "source": None
                })

    elif isinstance(raw_data, dict):
        possible_list = raw_data.get("results") or raw_data.get("urls")

        if isinstance(possible_list, list):
            for item in possible_list:
                if isinstance(item, dict):

                    url = item.get("url") or item.get("link")

                    if isinstance(url, str):
                        input_articles.append({
                            "url": url,
                            "title": item.get("title"),
                            "publishedAt": item.get("publishedAt"),
                            "source": item.get("source")
                        })

                elif isinstance(item, str):
                    input_articles.append({
                        "url": item,
                        "title": None,
                        "publishedAt": None,
                        "source": None
                    })

    # ===============================
    # Initialize output file
    # ===============================
    # if not os.path.exists(OUTPUT_FILE):
    #     with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    #         json.dump({
    #             "generated_at": datetime.now(timezone.utc).isoformat(),
    #             "results": [],
    #             "failed_urls": []
    #         }, f, indent=2)
    if not os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump({
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "results": [],
                "no_related_reports": [],
                "failed_urls": []
            }, f, indent=2)

    # Resume support
    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        saved = json.load(f)

    results = saved.get("results", [])
    no_related = saved.get("no_related_reports", [])

    processed = {
        normalize_url(r["input_article"]["url"])
        for r in results
        if isinstance(r, dict)
    }

    # ===============================
    # Process one by one
    # ===============================
    for article in input_articles:

        url = article["url"]

        if not isinstance(url, str):
            continue

        if normalize_url(url) in processed:
            continue

        print("Processing:", url)

        try:
            # ✅ pass full metadata object
            result = await process_article(article)

            # if result:
            #     results.append(result)

            #     with open(OUTPUT_FILE, "r+", encoding="utf-8") as f:
            #         data = json.load(f)
            #         data["results"].append(result)
            #         data["generated_at"] = datetime.now(timezone.utc).isoformat()
            #         f.seek(0)
            #         json.dump(data, f, indent=2, ensure_ascii=False)
            #         f.truncate()

            #     print("Saved")
            if result:

            # =========================
            # CASE 1 — No related reports
            # =========================
                if not result.get("related_reports"):

                    print("No related reports found")

                    with open(OUTPUT_FILE, "r+", encoding="utf-8") as f:
                        data = json.load(f)

                        data.setdefault("no_related_reports", []).append({
                            "url": article["url"],
                            "title": article.get("title"),
                            "publishedAt": article.get("publishedAt")
                        })

                        data["generated_at"] = datetime.now(timezone.utc).isoformat()

                        f.seek(0)
                        json.dump(data, f, indent=2, ensure_ascii=False)
                        f.truncate()

                # =========================
                # CASE 2 — Normal result
                # =========================
                else:

                    results.append(result)

                    with open(OUTPUT_FILE, "r+", encoding="utf-8") as f:
                        data = json.load(f)

                        data.setdefault("results", []).append(result)
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
