import os
# pyrefly: ignore [missing-import]
from pymongo import MongoClient
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
import certifi

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/algoassist")
client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
db = client.get_database("algoassist")

users_collection = db["users"]
problems_collection = db["problems"]
sessions_collection = db["sessions"]
