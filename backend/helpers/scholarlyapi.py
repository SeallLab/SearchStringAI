import requests
import traceback


def get_abstracts_semantic_scholar(quantity: int, search_query: str) -> str:
    '''
    returns (quantity) paper abstracts from semantic scholar given the search_query
    '''

    url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={search_query}&limit={quantity}&fields=abstract"
        
    
    try:
        entries = []
        res = requests.get(url)
        papers = res.json()['data']
        
        for paper in papers:
            p = []

            p.append(f"Title: {paper['title']}\n")
            p.append(f"Abstract: {paper.get('abstract', 'No abstract available')}\n\n")

            entries.append(''.join(p))
        
    
    except Exception as e:
        print(f"Error getting paper abstracts: {e}")
        traceback.print_exc()
        return ""
    finally:
        
        return ''.join(entries)
        


q = "software engineering"

s = get_abstracts_semantic_scholar(5, q)
print(s)