from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_huggingface import HuggingFaceEmbeddings
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
import os
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import GPT4All

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


# Configure the LLM
local_path = "/home/inko/Seall Lab/SearchStringAI/RAG/mistral-7b-openorca.gguf2.Q4_0.gguf"

# Callbacks support token-wise streaming
callbacks = [StreamingStdOutCallbackHandler()]

# Verbose is required to pass to the callback manager
llm = GPT4All(model=local_path, callbacks=callbacks, verbose=True)


# Instantiate MongoDB Vector Search as a retriever
retriever = vector_store.as_retriever()

# Define prompt template
template = """
Use the following pieces of context to answer the question at the end.
{context}
Question: {question}
"""
custom_rag_prompt = PromptTemplate.from_template(template)

def format_docs(docs):
   return "\n\n".join(doc.page_content for doc in docs)

# Create chain
rag_chain = (
   {"context": retriever | format_docs, "question": RunnablePassthrough()}
   | custom_rag_prompt
   | llm
   | StrOutputParser()
)

# Prompt the chain
question = "What is a systematic review?"
answer = rag_chain.invoke(question)

# Return source documents
documents = retriever.invoke(question)
print("\nSource documents:")
pprint.pprint(documents)