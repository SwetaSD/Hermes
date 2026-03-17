export const extractTitleFromUrl = (url) => {
  if (!url) return "Unknown Title";

  try {
    // Get the last or second to last segment
    const parts = url.split('/').filter(p => p.length > 0);

    // Find the part that looks like the title (usually before the article/id part)
    let titlePart = parts[parts.length - 1];
    if (titlePart.includes('article') || titlePart.match(/^\d+$/) || titlePart.includes('.html') || titlePart.includes('.ece') || titlePart.includes('.cms')) {
      if (parts.length > 1) {
        titlePart = parts[parts.length - 2];
      }
    }

    // Sometimes the title is part of the filename like article-title-123.cms
    if (titlePart.includes('.html') || titlePart.includes('.ece') || titlePart.includes('.cms') || titlePart.includes('.aspx')) {
      titlePart = titlePart.split('.')[0];
      // remove trailing numbers if possible
      titlePart = titlePart.replace(/-\d+$/, '');
    }

    // Replace hyphens with spaces and capitalize words
    const readable = titlePart.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    return readable.length > 10 ? readable : "News Article";
  } catch (e) {
    return "News Article";
  }
};

/**
 * Generates synthetic "time ago" string to make UI look alive
 */
export const getRandomTimeAgo = (seedId) => {
  const hours = (seedId % 24) + 1;
  return `${hours}h ago`;
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
 * Process raw JSON into a flat array of article objects suitable for components
 */
export const processRawData = (rawData) => {
  if (!rawData || (!rawData.political_articles_data && !rawData.non_political_articles_data)) return [];

  const allArticles = [
    ...(rawData.political_articles_data || []),
    ...(rawData.non_political_articles_data || [])
  ];

  return allArticles.map(article => ({
    id: article.news_id,
    title: extractTitleFromUrl(article.main_news?.url),
    url: article.main_news?.url,
    source: article.main_news?.source || "Unknown Source",
    category: article.category || "General",
    timeAgo: getRandomTimeAgo(article.news_id),
    sourcesCount: article.bias_classification?.total_references || 1,
    biasScale: normalizeBiasData(article.bias_classification),
    finalBias: article.bias_classification?.final_bias || 'unknown'
  }));
};
