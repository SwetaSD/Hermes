import subprocess
import sys
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PIPELINE_DIR = os.path.join(BASE_DIR, "start_pipeline")

SCRIPTS = [
    "fetch_news_indian.py",
    "Fetch_Similar_News.py",   
    "classify_news.py",        
    "LCR_classified.py"
]

def run_script(script):
    script_path = os.path.join(PIPELINE_DIR, script)

    if not os.path.exists(script_path):
        print(f"❌ Missing: {script}")
        return False

    print(f"▶ Running: {script}")

    result = subprocess.run(
        [sys.executable, script_path],
        cwd=BASE_DIR,
        capture_output=True,
        text=True
    )

    print(result.stdout)

    if result.returncode != 0:
        print(f"❌ Error in {script}")
        print(result.stderr)
        return False

    return True


def run_pipeline():
    print("🚀 Starting News Pipeline...\n")

    for script in SCRIPTS:
        success = run_script(script)
        if not success:
            print("⛔ Pipeline stopped due to error.")
            return

    print("\n✅ Pipeline Completed Successfully!")


if __name__ == "__main__":
    run_pipeline()