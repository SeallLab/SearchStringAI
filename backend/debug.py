from helpers.RAG.RAGutils import initialize_retriever, get_relevant_documents_safe
import os
from dotenv import load_dotenv
load_dotenv()
retriever = initialize_retriever(os.getenv("MONGO_URI"))

query = "What is a systematic map?"
docs = get_relevant_documents_safe(retriever, query)

print(f"Found {len(docs)} documents")
for d in docs:
    print(d.page_content[:200])
