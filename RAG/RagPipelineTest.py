import os
import pprint
from dotenv import load_dotenv
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.llms import GPT4All
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from pymongo import MongoClient
from pathlib import Path

# -------------------------------------------------------------------
# 1. Load environment and connection
# -------------------------------------------------------------------
load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("❌ MONGODB_URI not found in .env file")

DB_NAMESPACE = "langchain_db.document_rag"

# -------------------------------------------------------------------
# 2. Initialize embedding model
# -------------------------------------------------------------------
print("🔹 Loading embedding model...")
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# -------------------------------------------------------------------
# 3. Connect to MongoDB Atlas vector store
# -------------------------------------------------------------------
print("🔹 Connecting to MongoDB Atlas...")
vector_store = MongoDBAtlasVectorSearch.from_connection_string(
    connection_string=MONGODB_URI,
    namespace=DB_NAMESPACE,
    embedding=embedding_model,
    index_name="vector_index"
)

# -------------------------------------------------------------------
# 4. Load all PDFs in /documents and split
# -------------------------------------------------------------------
docs_folder = Path("documents")
all_docs = []

for pdf_file in docs_folder.glob("*.pdf"):
    print(f"📄 Loading PDF: {pdf_file}")
    loader = PyPDFLoader(str(pdf_file))
    data = loader.load()

    print(f"✂️ Splitting PDF into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=20)
    chunks = text_splitter.split_documents(data)
    all_docs.extend(chunks)

print(f"📄 Total chunks to process: {len(all_docs)}")

# -------------------------------------------------------------------
# 5. Only upload vectors if collection is empty
# -------------------------------------------------------------------
db_name, coll_name = DB_NAMESPACE.split(".")
mongo_client = MongoClient(MONGODB_URI)
collection = mongo_client[db_name][coll_name]

existing_docs = collection.count_documents({})

if existing_docs > 0:
    print(f"⚠️ Collection already contains {existing_docs} documents — skipping upload.")
else:
    print("📥 Adding documents to MongoDB vector store...")
    vector_store.add_documents(all_docs)
    print("✅ Documents added successfully.")
    vector_store.create_vector_search_index(dimensions=384)  # matches MiniLM
    print("🧱 Vector search index created.")

# -------------------------------------------------------------------
# 6. Load local LLM (optional)
# -------------------------------------------------------------------
local_model_path = "./mistral-7b-openorca.gguf2.Q4_0.gguf"
print(f"🤖 Loading local model from {local_model_path} (this may take a bit)...")
callbacks = [StreamingStdOutCallbackHandler()]
llm = GPT4All(model=local_model_path, callbacks=callbacks, verbose=True, device="cpu")

# -------------------------------------------------------------------
# 7. Create RAG chain
# -------------------------------------------------------------------
retriever = vector_store.as_retriever()

template = """
Use the following pieces of context to answer the question at the end.

{context}

Question: {question}
"""
custom_rag_prompt = PromptTemplate.from_template(template)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | custom_rag_prompt
    | llm
    | StrOutputParser()
)

# -------------------------------------------------------------------
# 8. Interactive question loop
# -------------------------------------------------------------------
print("\n💬 Ready! Ask a question about the documents (type 'exit' to quit)\n")

while True:
    question = input("Question: ").strip()
    if question.lower() in ["exit", "quit"]:
        print("👋 Exiting.")
        break

    print("\n🧠 Thinking...\n")
    answer = rag_chain.invoke(question)
    print("\nAnswer:", answer)

    documents = retriever.invoke(question)
    print("\n📚 Source documents:")
    pprint.pprint(documents[:2])  # show a few sources
    print("-" * 80)
