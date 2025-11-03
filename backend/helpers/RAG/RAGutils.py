from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
import os

def initialize_retriever(mongo_uri: str, namespace: str = "SLRMentor.document_rag", index_name: str = "vector_index"):
    """
    Initialize a LangChain retriever using MongoDB Atlas and HuggingFace embeddings.
    """
    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vector_store = MongoDBAtlasVectorSearch.from_connection_string(
        connection_string=mongo_uri,
        namespace=namespace,
        embedding=embedding_model,
        index_name=index_name
    )
    retriever = vector_store.as_retriever()
    return retriever


def get_relevant_documents_safe(retriever, query: str):
    """
    Safely call the retriever to get documents regardless of method differences.
    """
    if hasattr(retriever, "get_relevant_documents"):
        return retriever.get_relevant_documents(query)
    elif hasattr(retriever, "retrieve"):
        return retriever.retrieve(query)
    elif hasattr(retriever, "invoke"):
        return retriever.invoke(query)
    else:
        raise AttributeError("Retriever does not have a known query method.")



def format_docs(docs: list) -> list:
    """
    Extracts the text from a list of document dicts, removing embeddings.

    Args:
        docs (list of dict or Document-like objects): Documents returned from the retriever.

    Returns:
        list of str: The text content of each document.
    """
    texts = []

    for doc in docs:
        # If doc is a dict from MongoDB
        if isinstance(doc, dict):
            text = doc.get("text") or doc.get("page_content")
        else:
            # If doc is a LangChain Document object
            text = getattr(doc, "page_content", None) or getattr(doc, "text", None)
        if text:
            texts.append(text)

    return texts
