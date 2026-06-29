import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/algoassist")
client = MongoClient(MONGO_URI)
db = client.get_database("algoassist") if "localhost" in MONGO_URI else client.get_database()

users_collection = db["users"]
problems_collection = db["problems"]
sessions_collection = db["sessions"]
