import socket
from pymongo import MongoClient
import os

try:
    mongo_uri = os.environ.get("MONGO_URI", "mongodb://mongodb:27017/echoguard")
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
    # verify connection quickly
    client.admin.command('ping')
except Exception as e:
    print(f"MongoDB unavailable: {e}")
    # Still keep client object so import doesn't fail, but it will throw when queried
    client = MongoClient(mongo_uri, connect=False, serverSelectionTimeoutMS=2000)

db = client.get_database("echoguard")
