from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_huggingface import HuggingFaceEmbeddings
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
import os

load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")


# Load the embedding model (https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1)
embedding_model = HuggingFaceEmbeddings(model_name="mixedbread-ai/mxbai-embed-large-v1")

# Instantiate vector store
vector_store = MongoDBAtlasVectorSearch.from_connection_string(
   connection_string = MONGODB_URI,
   namespace = "langchain_db.local_rag",
   embedding=embedding_model,
   index_name="vector_index"
)

# Load the PDF
loader = PyPDFLoader("documents/001_Petersen.pdf")
data = loader.load()
print(data)

# Split PDF into documents
text_splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=20)
docs = text_splitter.split_documents(data)

## Add data to the vector store
# vector_store.add_documents(docs)

vector_store.create_vector_search_index(
   dimensions = 1024 # The dimensions of the vector embeddings to be indexed
)