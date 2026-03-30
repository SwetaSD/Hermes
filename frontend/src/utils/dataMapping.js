/**
 * Computes a human-readable relative time string from a date string.
 * Falls back to a seed-based synthetic time if parsing fails.
 */
export const getTimeAgo = (publishedAt, seedId = 0) => {
  if (!publishedAt) {
    // Fallback for missing dates
    const hours = (seedId % 24) + 1;
    return `${hours}h ago`;
  }

  try {
    const published = new Date(publishedAt);
    const now = new Date();
    const diffMs = now - published;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  } catch (e) {
    const hours = (seedId % 24) + 1;
    return `${hours}h ago`;
  }
};

/**
 * Kept for backward compatibility — prefer real titles from data.
 */
export const extractTitleFromUrl = (url) => {
  if (!url) return "Unknown Title";

  try {
    const parts = url.split('/').filter(p => p.length > 0);
    let titlePart = parts[parts.length - 1];
    if (titlePart.includes('article') || titlePart.match(/^\d+$/) || titlePart.includes('.html') || titlePart.includes('.ece') || titlePart.includes('.cms')) {
      if (parts.length > 1) {
        titlePart = parts[parts.length - 2];
      }
    }

    if (titlePart.includes('.html') || titlePart.includes('.ece') || titlePart.includes('.cms') || titlePart.includes('.aspx')) {
      titlePart = titlePart.split('.')[0];
      titlePart = titlePart.replace(/-\d+$/, '');
    }

    const readable = titlePart.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    return readable.length > 10 ? readable : "News Article";
  } catch (e) {
    return "News Article";
  }
};

/**
 * Normalizes bias data exactly returning left/center/right/unbiased/unknown percentages
 */
export const normalizeBiasData = (biasClassification) => {
  if (!biasClassification?.wing_distribution) {
    return { left: 0, center: 0, right: 0, unbiased: 0, unknown: 100 };
  }
  return biasClassification.wing_distribution;
};

/**
 * Strip HTML tags from a string (some description fields contain raw HTML)
 */
const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
};

// Pool of fallback Unsplash news images
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1504711434969-e33886168d5c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1557992260-ec58e38d363c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1541872526-9f8f260170a7?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1558434653-271dbdebfbc7?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&q=80&w=800',
];

/**
 * Get a deterministic fallback image based on index
 */
export const getFallbackImage = (index) => {
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
};

/**
 * Process raw JSON into a flat array of article objects suitable for components.
 * Maps the new bias_classified_output.json structure.
 */
export const processRawData = (rawData) => {
  if (!rawData || (!rawData.political_articles_data && !rawData.non_political_articles_data)) return [];

  const allArticles = [
    ...(rawData.political_articles_data || []),
    ...(rawData.non_political_articles_data || [])
  ];

  return allArticles.map((article, index) => ({
    id: index,
    // Real title from input_article, fallback to URL extraction
    title: article.input_article?.title || extractTitleFromUrl(article.input_article?.url),
    url: article.input_article?.url,
    source: article.input_article?.source_name || "Unknown Source",
    category: article.category || "General",
    // Real publish time
    timeAgo: getTimeAgo(article.input_article?.publishedAt, index),
    publishedAt: article.input_article?.publishedAt,
    // Real image from the article
    imageUrl: article.input_article?.image_url || getFallbackImage(index),
    sourcesCount: article.bias_classification?.total_sources || 1,
    biasScale: normalizeBiasData(article.bias_classification),
    finalBias: article.bias_classification?.final_bias || 'unknown',
    // Real summaries
    snippet: article.input_article?.summary || article.story_summary || "Coverage details are being analyzed across multiple media outlets.",
    storySummary: article.story_summary || article.input_article?.summary || "",
    // Bias breakdown
    referenceCountByBias: article.bias_classification?.reference_count_by_bias || {},
    // Related reports with full real data
    references: (article.related_reports || []).map((ref, refIdx) => ({
      title: ref.title || extractTitleFromUrl(ref.url),
      source: ref.source_name || "Unknown Source",
      url: ref.url,
      publishedAt: ref.publishedAt,
      timeAgo: getTimeAgo(ref.publishedAt, index * 10 + refIdx),
      summary: ref.summary || stripHtml(ref.description) || "",
      imageUrl: ref.image_url || getFallbackImage(index + refIdx + 5),
      bias: ref.bias || 'unknown',
      similarityScore: ref.similarity_score || 0,
    }))
  }));
};
