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


def format_top_documents(docs: list, top_k: int = 5) -> list:
    """
    Formats top documents returned by the retriever into dicts suitable for JSON responses.
    """
    formatted_docs = [
        {"page_content": doc.page_content, "metadata": getattr(doc, "metadata", {})}
        for doc in docs[:top_k]
    ]
    return formatted_docs
