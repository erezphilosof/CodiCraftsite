import re
import os

path = r"C:\Users\User\.gemini\antigravity\brain\5a5459c3-fb05-45a5-a115-eb79b402b39e\.system_generated\steps\2674\content.md"

if not os.path.exists(path):
    print("File not found:", path)
    exit(1)

with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

# Let's find all URLs in the HTML
urls = re.findall(r'https?://[^\s\"\'\(\)\<\>\\\]\[\}]+', html)

with open("found_urls.txt", "w", encoding="utf-8") as out:
    for url in sorted(list(set(urls))):
        out.write(url + "\n")

print("Saved all URLs to found_urls.txt")

# Let's also look for strings ending in .glb or containing glb/model/meshy
interesting = []
for url in set(urls):
    if ".glb" in url.lower() or "model" in url.lower() or "cdn.meshy.ai" in url.lower():
        interesting.append(url)

print(f"Found {len(interesting)} interesting URLs:")
for u in sorted(interesting):
    print(u)
