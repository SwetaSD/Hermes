import json
import os
import copy
from collections import Counter
from typing import Dict, List, Tuple
from urllib.parse import urlparse


class NewsBiasClassifier:
    def __init__(self, publisher_list_path: str, classified_news_path: str):

        # Load publisher bias list
        with open(publisher_list_path, 'r', encoding='utf-8') as f:
            publishers = json.load(f)

        self.domain_bias_map = {
            pub['Domain'].lower(): pub['Final Bias'].lower()
            for pub in publishers
        }

        # Load classified news
        with open(classified_news_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            self.news_articles = data["results"] 

    # -------------------------------
    # Utility functions
    # -------------------------------

    def extract_domain(self, url: str) -> str:
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()

            if domain.startswith("www."):
                domain = domain[4:]

            parts = domain.split(".")
            if len(parts) > 2:
                domain = ".".join(parts[-2:])

            return domain.strip()
        except:
            return ""

    def get_bias_for_url(self, url: str) -> str:
        domain = self.extract_domain(url)
        return self.domain_bias_map.get(domain, "unknown")

    def calculate_wing_distribution(self, biases: List[str]) -> Dict[str, float]:
        total = len(biases)
        counter = Counter(biases)

        return {
            "left": round((counter.get("left", 0) / total) * 100, 2) if total else 0,
            "center": round((counter.get("center", 0) / total) * 100, 2) if total else 0,
            "right": round((counter.get("right", 0) / total) * 100, 2) if total else 0,
            "unbiased": round((counter.get("unbiased", 0) / total) * 100, 2) if total else 0,
            "unknown": round((counter.get("unknown", 0) / total) * 100, 2) if total else 0
        }

    def determine_final_bias(self, biases: List[str]) -> str:
        known = [b for b in biases if b != "unknown"]

        if not known:
            return "undefined"

        counter = Counter(known)

        if counter.get("unbiased", 0) > len(known) / 2:
            return "undefined"

        political = ["left", "center", "right"]
        counts = {b: counter.get(b, 0) for b in political}

        max_count = max(counts.values())
        winners = [b for b, c in counts.items() if c == max_count]

        return winners[0] if len(winners) == 1 else "undefined"

    # -------------------------------
    # Bias classification helpers
    # -------------------------------

    def classify_related_reports(self, related_reports: List[Dict]) -> Tuple[List[Dict], List[str]]:
        enriched_reports = []
        biases = []

        for report in related_reports:
            report_copy = copy.deepcopy(report)  

            url = report_copy.get("url", "")
            bias = self.get_bias_for_url(url)

            report_copy["bias"] = bias 

            enriched_reports.append(report_copy)
            biases.append(bias)

        return enriched_reports, biases

    # -------------------------------
    # Main classification logic
    # -------------------------------

    def classify_article(self, article: Dict) -> Tuple[Dict, str]:

        # ✅ FULL DEEP COPY → preserves EVERYTHING (title, image, publishedAt, etc.)
        result = copy.deepcopy(article)

        # 👉 APPLY ONLY FOR POLITICAL
        if result.get("category") == "political":

            related_reports = result.get("related_reports", [])

            enriched_reports, report_biases = self.classify_related_reports(related_reports)

            result["related_reports"] = enriched_reports

            # Main article bias
            main_url = result.get("input_article", {}).get("url", "")
            main_bias = self.get_bias_for_url(main_url)

            all_biases = report_biases.copy()
            if main_bias != "unknown":
                all_biases.append(main_bias)

            # ✅ ADD bias classification block
            result["bias_classification"] = {
                "final_bias": self.determine_final_bias(all_biases),
                "wing_distribution": self.calculate_wing_distribution(all_biases),
                "reference_count_by_bias": dict(Counter(all_biases)),
                "total_sources": len(all_biases),
                "similar_news_bias_distribution": self.calculate_wing_distribution(report_biases)
            }

            return result, "political"

        # ✅ NON-POLITICAL → COMPLETELY UNTOUCHED
        return result, "non-political"

    # -------------------------------
    # Process all articles
    # -------------------------------

    def classify_all_articles(self):
        political = []
        non_political = []

        for article in self.news_articles:
            classified, article_type = self.classify_article(article)

            if article_type == "political":
                political.append(classified)
            else:
                non_political.append(classified)

        return political, non_political

    # -------------------------------
    # Save final output
    # -------------------------------

    def save_results(self, output_path: str):

        political, non_political = self.classify_all_articles()

        bias_counter = Counter(
            art["bias_classification"]["final_bias"]
            for art in political
        )

        report = {
            "total_articles": len(political) + len(non_political),
            "political_articles": len(political),
            "non_political_articles": len(non_political),

            "final_bias_distribution": {
                "left": bias_counter.get("left", 0),
                "center": bias_counter.get("center", 0),
                "right": bias_counter.get("right", 0),
                "undefined": bias_counter.get("undefined", 0)
            },

            "political_articles_data": political,
            "non_political_articles_data": non_political
        }

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        print("✅ Bias classification completed!")
        print(f"📁 Output saved to: {output_path}")


# -------------------------------
# Entry point
# -------------------------------

if __name__ == "__main__":

    BASE_DIR = os.path.dirname(os.path.dirname(__file__))

    classifier = NewsBiasClassifier(
        publisher_list_path=os.path.join(BASE_DIR, "data", "publisher_list.json"),
        classified_news_path=os.path.join(BASE_DIR, "data", "classified_news.json")
    )

    classifier.save_results(
        os.path.join(BASE_DIR, "data", "bias_classified_output.json")
    )