# Hermes 📰

Hermes is a AI Powered News pipeline that aggregates Indian news from RSS sources, finds similar articles, classifies them by publisher bias, and generates structured outputs for analysis.

---

##  Project Overview

Hermes follows a multi-stage news processing pipeline:

1. Fetch RSS news sources
2. Extract raw news
3. Detect similar articles
4. Classify news
5. Apply LCR (Left-Center-Right) classification
6. Generate final structured results

---

## 📂 Project Flow

rss_sources_indian.py  
⬇  
fetch_news_indian.py  
⬇  
raw_news_indian.json  
⬇  
Fetch_Similar_News.py  <- publisher_cache.json
⬇  
Similar_Links_Output.json  
⬇  
classified_news.py  
⬇  
classified_news.json  
⬇  
Lcr_classified.py  <- publisher_list.json
⬇  
classified_results.json  

---

### To be updated
