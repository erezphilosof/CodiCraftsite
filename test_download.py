import urllib.request
import urllib.parse
import os

url = "https://www.meshy.ai/3d-models/Little-Builder-v2-019ee0e5-6587-7955-a24a-4cf67429bc0c?download=glb"
req = urllib.request.Request(
    url,
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
)

print(f"Requesting {url}...")
try:
    with urllib.request.urlopen(req) as response:
        info = response.info()
        final_url = response.geturl()
        print("Final URL after redirects:", final_url)
        print("Content Type:", info.get_content_type())
        data = response.read(100)
        print("First 20 bytes:", data[:20])
except Exception as e:
    print("Failed:", e)
