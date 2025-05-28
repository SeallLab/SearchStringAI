from flask import Flask
from flask_cors import CORS
from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
import os
import json
import datetime

import helpers.cryptographic_helpers as ch

app = Flask(__name__)
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)
hash_byte_length = 16
chat_hash_length = 8
CORS(app)

@app.route("/", methods=['GET'])
def test():
    return "Server is live ;)"

@app.route("/createchat", methods=['GET'])
def create_chat():
    return_request = {
        "hash": "",
        "status": False,
        "message": "whoops, something went wrong"
    }
    try:
        
        hash = ch.generate_hash(hash_byte_length, chat_hash_length)
    
        
        
        #check if generated hash already exists in db
        existing = mongo.db.chats.find_one({"_id": hash})
        if existing:
            return_request["message"] = "whoops, something went wrong. Try creating a new chat again"
            return  return_request
        
        #create new messege history related to the hash in db
        new_chat = {
            "_id": hash,  
            "chat_history": {},
            "chat_creation_date": datetime.datetime.now()
        }
        
        mongo.db.chats.insert_one(new_chat)
        
        #update return request with correct info
        return_request["hash"] = hash
        return_request["status"] = True
        return_request["message"] = "Succesfully"
        
    except Exception as e:
        print(e)
        
    finally:
        return return_request
    
@app.route("/createchat", methods=['GET'])
def create_chat():
    return_request = {
        "hash": "",
        "status": False,
        "message": "whoops, something went wrong"
    }