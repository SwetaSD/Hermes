import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { processRawData, extractTitleFromUrl, getTimeAgo, normalizeBiasData, getFallbackImage } from '../utils/dataMapping';
import classifiedData from '../../../project/data/bias_classified_output.json';

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
};

const Article = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedStories, setRelatedStories] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const allArticles = [
      ...(classifiedData.political_articles_data || []),
      ...(classifiedData.non_political_articles_data || [])
    ];

    const articleIndex = parseInt(id);
    const foundArticle = allArticles[articleIndex];

    if (foundArticle) {
      const biasData = normalizeBiasData(foundArticle.bias_classification);
      const processed = {
        id: articleIndex,
        url: foundArticle.input_article?.url,
        title: foundArticle.input_article?.title || extractTitleFromUrl(foundArticle.input_article?.url),
        source: foundArticle.input_article?.source_name || "Unknown Source",
        category: foundArticle.category || "General",
        timeAgo: getTimeAgo(foundArticle.input_article?.publishedAt, articleIndex),
        publishedAt: foundArticle.input_article?.publishedAt,
        imageUrl: foundArticle.input_article?.image_url || getFallbackImage(articleIndex),
        sourcesCount: foundArticle.bias_classification?.total_sources || 1,
        biasScale: biasData,
        finalBias: foundArticle.bias_classification?.final_bias || 'unknown',
        // Real summaries
        summary: foundArticle.input_article?.summary || "",
        storySummary: foundArticle.story_summary || "",
        // Real related reports with per-source bias
        references: (foundArticle.related_reports || []).map((ref, refIdx) => ({
          title: ref.title || extractTitleFromUrl(ref.url),
          source: ref.source_name || "Unknown Source",
          url: ref.url,
          publishedAt: ref.publishedAt,
          timeAgo: getTimeAgo(ref.publishedAt, articleIndex * 10 + refIdx),
          summary: ref.summary || stripHtml(ref.description) || "",
          imageUrl: ref.image_url || getFallbackImage(articleIndex + refIdx + 5),
          bias: ref.bias || 'unknown',
          similarityScore: ref.similarity_score || 0,
        })),
        referenceCountByBias: foundArticle.bias_classification?.reference_count_by_bias || {}
      };
      setArticle(processed);

      // Get related stories from same category
      const processedAll = processRawData(classifiedData);
      const related = processedAll
        .filter(s => s.category === processed.category && s.id !== processed.id)
        .slice(0, 3);
      setRelatedStories(related);
    }
  }, [id]);

  if (!article) {
    const processedAll = processRawData(classifiedData);
    return (
      <div className="app-container">
        <Header totalSources={classifiedData?.total_articles || 0} totalStories={processedAll.length} />
        <main className="main-content container article-not-found">
          <h2>Article not found</h2>
          <Link to="/explore" className="back-link">Return to Explore</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const getSourceInitial = (sourceName) => {
    return sourceName ? sourceName.charAt(0).toUpperCase() : 'U';
  };

  const getBiasColor = (biasLabel) => {
    const label = (biasLabel || '').toLowerCase();
    if (label.includes('left')) return 'bias-tag--left';
    if (label.includes('right')) return 'bias-tag--right';
    if (label.includes('center')) return 'bias-tag--center';
    if (label === 'unbiased') return 'bias-tag--center';
    return 'bias-tag--unknown';
  };

  // Use the real story_summary or generate from available data
  const getArticleSummary = () => {
    if (article.storySummary) return article.storySummary;
    if (article.summary) return article.summary;

    const sourceCount = article.sourcesCount;
    const biasBreakdown = Object.entries(article.referenceCountByBias)
      .filter(([, count]) => count > 0)
      .map(([bias, count]) => `${count} ${bias}`)
      .join(', ');

    return `This story from ${article.source} is covered by ${sourceCount} source${sourceCount !== 1 ? 's' : ''}. ` +
      (biasBreakdown ? `The coverage breakdown includes ${biasBreakdown} leaning sources. ` : '') +
      `The overall bias classification is "${article.finalBias}".`;
  };

  // Bias distribution bar segments
  const biasSegments = [
    { key: 'left', label: 'Left', value: article.biasScale.left, color: 'var(--bias-left)' },
    { key: 'center', label: 'Center', value: article.biasScale.center, color: 'var(--bias-center)' },
    { key: 'unbiased', label: 'Unbiased', value: article.biasScale.unbiased, color: 'var(--bias-unbiased)' },
    { key: 'right', label: 'Right', value: article.biasScale.right, color: 'var(--bias-right)' },
    { key: 'unknown', label: 'Unknown', value: article.biasScale.unknown, color: 'var(--bias-unknown)' },
  ].filter(s => s.value > 0);

  const categoryDisplay = article.category === 'non_political' ? 'GENERAL' : article.category.toUpperCase();
  const processedAll = processRawData(classifiedData);

  return (
    <div className="app-container article-page">
      <Header
        totalSources={classifiedData?.total_articles || 0}
        totalStories={processedAll.length}
      />

      {/* Hero Section */}
      <div className="article-hero">
        <div className="article-hero__image-wrapper">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="article-hero__image"
          />
          <div className="article-hero__overlay" />
        </div>
        <div className="article-hero__content container">
          <span className="article-hero__category">{categoryDisplay}</span>
          <h1 className="article-hero__title">{article.title}</h1>
          <div className="article-hero__meta">
            <span>{article.source}</span>
            <span className="meta-dot" />
            <span>{article.timeAgo}</span>
          </div>
        </div>
      </div>

      <main className="main-content container article-body">
        <div className="article-layout">

          {/* Left: Main content */}
          <div className="article-main">

            {/* AI Summary — now uses real story_summary */}
            <div className="article-summary">
              <h3 className="article-summary__label">AI Summary</h3>
              <p className="article-summary__text">{getArticleSummary()}</p>
            </div>

            {/* Coverage Section */}
            <div className="article-coverage">
              <h3 className="article-coverage__label">
                How different sources cover this story
              </h3>

              {/* Main source */}
              <div className="coverage-item">
                <div className="coverage-item__icon">
                  {getSourceInitial(article.source)}
                </div>
                <div className="coverage-item__body">
                  <div className="coverage-item__header">
                    <span className="coverage-item__source">{article.source}</span>
                    {article.finalBias !== 'unknown' && (
                      <span className={`coverage-item__bias-tag ${getBiasColor(article.finalBias)}`}>
                        {article.finalBias}
                      </span>
                    )}
                    <span className="coverage-item__time">{article.timeAgo}</span>
                  </div>
                  <h4 className="coverage-item__title">
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      {article.title}
                    </a>
                  </h4>
                  {article.summary && (
                    <p className="coverage-item__summary">{article.summary}</p>
                  )}
                </div>
              </div>

              {/* Related Reports — real titles, bias, and time */}
              {article.references.length > 0 ? (
                article.references.map((ref, i) => (
                  <div key={i} className="coverage-item coverage-item--bordered">
                    <div className="coverage-item__icon">
                      {getSourceInitial(ref.source)}
                    </div>
                    <div className="coverage-item__body">
                      <div className="coverage-item__header">
                        <span className="coverage-item__source">{ref.source}</span>
                        <span className={`coverage-item__bias-tag ${getBiasColor(ref.bias)}`}>
                          {ref.bias.toUpperCase()}
                        </span>
                        <span className="coverage-item__time">
                          {ref.timeAgo}
                        </span>
                      </div>
                      <h4 className="coverage-item__title">
                        <a href={ref.url} target="_blank" rel="noopener noreferrer">
                          {ref.title}
                        </a>
                      </h4>
                      {ref.summary && (
                        <p className="coverage-item__summary">{ref.summary}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="coverage-empty">No alternative coverages available for this story.</div>
              )}
            </div>
          </div>

          {/* Right: Sidebar */}
          <aside className="article-sidebar">
            {/* Sources at a Glance */}
            <div className="sidebar-card">
              <h3 className="sidebar-card__label">Sources at a Glance</h3>
              <div className="sidebar-bias-chart">
                <div className="sidebar-bias-chart__bars">
                  {biasSegments.map(seg => (
                    <div
                      key={seg.key}
                      className="sidebar-bias-chart__bar"
                      style={{
                        width: `${seg.value}%`,
                        backgroundColor: seg.color
                      }}
                      title={`${seg.label}: ${seg.value}%`}
                    />
                  ))}
                </div>
                <div className="sidebar-bias-chart__labels">
                  {biasSegments.map(seg => (
                    <div
                      key={`label-${seg.key}`}
                      className="sidebar-bias-chart__label-item"
                      style={{ width: `${seg.value}%` }}
                    >
                      <span className="sidebar-bias-chart__pct">{Math.round(seg.value)}%</span>
                      <span className="sidebar-bias-chart__label-text">{seg.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Highlighted quote-like card */}
            <div className="sidebar-card sidebar-card--dark">
              <p className="sidebar-card__quote">
                "{article.sourcesCount} source{article.sourcesCount !== 1 ? 's' : ''} covering this story — bias leaning: {article.finalBias}"
              </p>
              <span className="sidebar-card__attr">— Hermes Analysis</span>
            </div>

            {/* Consensus Meter */}
            <div className="sidebar-card">
              <h3 className="sidebar-card__label">Consensus Meter</h3>
              <div className="consensus-meter">
                <div className="consensus-meter__value">
                  {article.sourcesCount}
                </div>
                <span className="consensus-meter__unit">total sources</span>
              </div>
              <div className="consensus-meter__breakdown">
                {Object.entries(article.referenceCountByBias).map(([bias, count]) => (
                  <div key={bias} className="consensus-meter__row">
                    <span className={`consensus-meter__dot ${getBiasColor(bias)}`} />
                    <span className="consensus-meter__row-label">{bias}</span>
                    <span className="consensus-meter__row-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Related Stories */}
        {relatedStories.length > 0 && (
          <div className="article-related">
            <h3 className="article-related__label">Related Stories</h3>
            <div className="article-related__grid">
              {relatedStories.map((story) => (
                <Link to={`/article/${story.id}`} key={story.id} className="related-card">
                  <div className="related-card__image-wrapper">
                    <img
                      src={story.imageUrl}
                      alt={story.title}
                      className="related-card__image"
                    />
                  </div>
                  <div className="related-card__category">
                    {story.category === 'non_political' ? 'GENERAL' : story.category.toUpperCase()}
                  </div>
                  <h4 className="related-card__title">{story.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Article;
