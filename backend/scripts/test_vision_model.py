import requests
import json
import time
from app.config import settings

def test():
    sample_b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    models_to_try = [
        "gemini-3.6-flash",
        "gemini-3.8-flash",
        "gemini-3.5-flash",
        "gemini-flash-latest"
    ]
    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{
                "parts": [
                    {"inlineData": {"mimeType": "image/png", "data": sample_b64}},
                    {"text": "Analyze image in 5 words."}
                ]
            }]
        }
        try:
            print(f"Testing {model}...")
            t0 = time.time()
            res = requests.post(url, json=payload, timeout=15)
            print(f"{model} Status: {res.status_code}, took {time.time()-t0:.2f}s")
            if res.status_code == 200:
                text = res.json().get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                print(f"Success from {model}: {text}")
                return model
            else:
                print(f"{model} response: {res.text[:200]}")
        except Exception as e:
            print(f"{model} error: {e}")
    return None

if __name__ == '__main__':
    test()
