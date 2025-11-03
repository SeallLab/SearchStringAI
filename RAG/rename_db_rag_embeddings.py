from dotenv import load_dotenv
import os
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

if not MONGO_URI:
    raise ValueError("MONGO_URI not found in environment variables.")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

original_field = "embedding"
new_field = "_vector"
result = collection.update_many(
    {original_field: {"$exists": True}},
    {"$rename": {original_field: new_field}}
)

print(f"Modified {result.modified_count} documents.")
