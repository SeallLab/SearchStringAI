import requests

query = "global software development"
url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={query}&limit=5&fields=title,abstract"

res = requests.get(url)
papers = res.json()['data']

for paper in papers:
    print(f"Title: {paper['title']}")
    print(f"Abstract: {paper.get('abstract', 'No abstract available')}\n")
