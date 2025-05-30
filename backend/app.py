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

@app.route("/createchat", methods=['POST'])
def create_chat():
    return_request = {
        "hash": "",
        "status": False,
        "message": "whoops, something went wrong"
    }
    status_code = 401

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
        status_code = 200
        
    except Exception as e:
        print(e)
        return_request["message"] = str(e)
        
    finally:
        return jsonify(return_request), status_code
    
@app.route("/getchathistory", methods=['POST'])
def get_chat_history():
    
    required_fields = ["hash_plain_text"]
    return_request = {
        "status": False,
        "message": "",
        "chat_history": {}
    }
    status_code = 401
    try:
        
        #validate that all required fields are present in request
        data = request.json
        if check_missing_or_blank_fields(data, required_fields):
            return_request["message"] = "request missing fields"
            raise ValueError("request missing fields")

        #validate hash exists
        hash = data["hash_plain_text"]
        chat_doc = mongo.db.chats.find_one({"_id": hash})
        if not chat_doc:
            return_request["message"] = "Chat with given hash doesnt exsist"
            return  jsonify(return_request), 401
        
        
        #get chat
        #print(chat_doc)
        return_request["chat_history"] = chat_doc["chat_history"]
        return_request["status"] = True
        status_code = 200
        
        #reutn the chat
    except Exception as e:
        print(e)
        status_code = 500
        return_request["message"] = str(e)
        
    finally:
        print()
        print(return_request)
        return jsonify(return_request), status_code
    
    
def check_missing_or_blank_fields(data, required_fields):
    '''returns true if a field is missing or is blank in the data json given from request'''
    if any(field not in data or data.get(field) in ["", None] for field in required_fields):
        return True
    return False