import json
from collections import Counter
from typing import Dict, List, Tuple
from urllib.parse import urlparse


class NewsBiasClassifier:
    def __init__(self, publisher_list_path: str, classified_news_path: str):
        """
        Initialize the classifier with publisher and news data.
        """
        with open(publisher_list_path, 'r', encoding='utf-8') as f:
            publishers = json.load(f)

        self.domain_bias_map = {
            pub['Domain'].lower(): pub['Final Bias'].lower()
            for pub in publishers
        }

        with open(classified_news_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            self.news_articles = data['classified_news']

    # def extract_domain(self, url: str) -> str:
    #     try:
    #         parsed = urlparse(url)
    #         domain = parsed.netloc.lower()
    #         if domain.startswith('www.'):
    #             domain = domain[4:]
    #         return domain
    #     except:
    #         return ""
    
    def extract_domain(self, url: str) -> str:
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()

        # Remove www
            if domain.startswith("www."):
                domain = domain[4:]

        # Remove subdomains like m., epaper., etc.
            parts = domain.split(".")
            if len(parts) > 2:
                domain = ".".join(parts[-2:])  # keep only main domain

            return domain.strip()
        except:
            return ""


    def get_bias_for_url(self, url: str) -> str:
        domain = self.extract_domain(url)
        return self.domain_bias_map.get(domain, "unknown")

    def calculate_wing_distribution(self, biases: List[str]) -> Dict[str, float]:
        if not biases:
            return {
                "left": 0.0,
                "center": 0.0,
                "right": 0.0,
                "unbiased": 0.0,
                "unknown": 0.0
            }

        total = len(biases)
        counter = Counter(biases)

        return {
            "left": round((counter.get("left", 0) / total) * 100, 2),
            "center": round((counter.get("center", 0) / total) * 100, 2),
            "right": round((counter.get("right", 0) / total) * 100, 2),
            "unbiased": round((counter.get("unbiased", 0) / total) * 100, 2),
            "unknown": round((counter.get("unknown", 0) / total) * 100, 2)
        }

    def determine_final_bias(self, biases: List[str]) -> str:
        if not biases:
            return "undefined"

        known_biases = [b for b in biases if b != "unknown"]
        if not known_biases:
            return "undefined"

        counter = Counter(known_biases)

        if counter.get("unbiased", 0) > len(known_biases) / 2:
            return "undefined"

        political_biases = ["left", "center", "right"]
        political_counter = {b: counter.get(b, 0) for b in political_biases}

        max_count = max(political_counter.values())
        if max_count == 0:
            return "undefined"

        winners = [b for b, c in political_counter.items() if c == max_count]
        return winners[0] if len(winners) == 1 else "undefined"

    def classify_article(self, article: Dict) -> Tuple[Dict, str]:
        result = article.copy()

        if article.get('category') != 'political':
            return result, 'non-political'

        references = article.get('references', [])
        biases = [self.get_bias_for_url(ref.get('url', '')) for ref in references]

        result['bias_classification'] = {
            "final_bias": self.determine_final_bias(biases),
            "wing_distribution": self.calculate_wing_distribution(biases),
            "reference_count_by_bias": dict(Counter(biases)),
            "total_references": len(references)
        }

        return result, 'political'
    
    def classify_article(self, article: Dict) -> Tuple[Dict, str]:
        result = article.copy()

        if article.get('category') != 'political':
            return result, 'non-political'

        references = article.get('references', [])
        biases = [self.get_bias_for_url(ref.get('url', '')) for ref in references]

    # ✅ ADD MAIN SOURCE BIAS
        main_source_url = article.get('main_news', {}).get('url', '')
        main_bias = self.get_bias_for_url(main_source_url)

        if main_bias != "unknown":
            biases.append(main_bias)

        result['bias_classification'] = {
        "final_bias": self.determine_final_bias(biases),
        "wing_distribution": self.calculate_wing_distribution(biases),
        "reference_count_by_bias": dict(Counter(biases)),
        "total_references": len(biases)
    }

        return result, 'political'


    def classify_all_articles(self) -> Tuple[List[Dict], List[Dict]]:
        political, non_political = [], []

        for article in self.news_articles:
            classified, article_type = self.classify_article(article)
            (political if article_type == 'political' else non_political).append(classified)

        return political, non_political

    def generate_classification_report(self) -> Tuple[Dict, Dict]:
        political_articles, non_political_articles = self.classify_all_articles()

        bias_counter = Counter(
            article['bias_classification']['final_bias']
            for article in political_articles
        )

        political_report = {
            "total_political_articles": len(political_articles),
            "final_bias_distribution": {
                "left": bias_counter.get("left", 0),
                "center": bias_counter.get("center", 0),
                "right": bias_counter.get("right", 0),
                "undefined": bias_counter.get("undefined", 0)
            },
            "articles": political_articles
        }

        non_political_report = {
            "total_non_political_articles": len(non_political_articles),
            "articles": non_political_articles
        }

        return political_report, non_political_report

    def save_results(self, output_path: str):
        political_report, non_political_report = self.generate_classification_report()

        report = {
            "total_articles": political_report["total_political_articles"]
                              + non_political_report["total_non_political_articles"],
            "political_articles": political_report["total_political_articles"],
            "non_political_articles": non_political_report["total_non_political_articles"],
            "final_bias_distribution": political_report["final_bias_distribution"],
            "political_articles_data": political_report["articles"],
            "non_political_articles_data": non_political_report["articles"]
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        print(f"Classification complete! Results saved to {output_path}")
        print("\nSummary:")
        print(f"Total Articles: {report['total_articles']}")
        print(f"Political Articles: {report['political_articles']}")
        print(f"Non-Political Articles: {report['non_political_articles']}")
        print("\nPolitical Bias Distribution:")
        print(f"  Left: {report['final_bias_distribution']['left']}")
        print(f"  Center: {report['final_bias_distribution']['center']}")
        print(f"  Right: {report['final_bias_distribution']['right']}")
        print(f"  Undefined: {report['final_bias_distribution']['undefined']}")


if __name__ == "__main__":
    classifier = NewsBiasClassifier(
        publisher_list_path='data/publisher_list.json',
        classified_news_path='data/classified_news.json'
    )

    classifier.save_results('data/classified_results.json')

    sample_article, _ = classifier.classify_article(classifier.news_articles[0])
    print("\n" + "=" * 80)
    print("Sample Article Classification:")
    print("=" * 80)
    print(f"News ID: {sample_article['news_id']}")
    print(f"Category: {sample_article['category']}")
    print(f"Main Source: {sample_article['main_news']['source']}")
    print("\nBias Classification:")
    print(json.dumps(sample_article.get('bias_classification', {}), indent=2))
