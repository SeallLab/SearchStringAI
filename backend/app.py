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
            return  jsonify(return_request), 401
        
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
        return jsonify(return_request), 200
    
@app.route("/getchathistory", methods=['post'])
def get_chat_history():
    
    required_fields = ["hash_plain_text"]
    return_request = {
        "status": False,
        "message": "",
        "chat_history": [{}]
    }
    try:
        
        #validate that all required fields are present in request
        data = request.json
        if check_missing_or_blank_fields(data, required_fields):
            return_request["message"] = "request missing fields"
            raise ValueError("request missing fields")

        #validate hash exists
        hash = data["hash"]
        chat_doc = mongo.db.chats.find_one({"_id": hash})
        if not chat_doc:
            return_request["message"] = "Chat with given hash doesnt exsist"
            return  jsonify(return_request), 401
        
        
        #get chat
        print(chat_doc)
        return_request["chat_history"] = chat_doc["chat_history"]
        
        #reutn the chat
    except Exception as e:
        print(e)
        
    finally:
        return return_request
    
    
def check_missing_or_blank_fields(data, required_fields):
    '''returns true if a field is missing or is blank in the data json given from request'''
    if any(field not in data or data.get(field) in ["", None] for field in required_fields):
        return True
    return False