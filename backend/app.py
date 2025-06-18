from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_pymongo import PyMongo
import os, json, datetime
from helpers.xploreapi.xploreapi import XPLORE #for thee IEEE xPlore API
import helpers.cryptographic_helpers as ch #Generating chat hashes and encypting the db stuff
from helpers.llm.promptBuilder import Prompt #for building prompts
import helpers.llm.llmPromptingUtils as pu #for actually calling the AI API
from google import genai
from google.genai.types import HttpOptions
from pydantic import BaseModel



app = Flask(__name__)
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)
CORS(app)
hash_byte_length = 16
chat_hash_length = 8
gemini_key = os.getenv('GEMINI_API_KEY')


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
            raise ValueError("whoops, something went wrong. Try creating a new chat again")

        
        #create new messege history related to the hash in db
        new_chat = {
            "_id": hash,  
            "chat_creation_date": datetime.datetime.now(),
            "chat_last_use": datetime.datetime.now(),
            "chat_history": [],
            "message_count": 0,
            "current_search_string": ""
        }
        
        mongo.db.chats.insert_one(new_chat)
        
        #update return request with correct info
        return_request["hash"] = hash
        return_request["status"] = True
        return_request["message"] = "Succesfully generated new chat"
        status_code = 200
        
    except Exception as e:
        print(e)
        return_request["message"] = str(e)
        
    finally:
        return jsonify(return_request), status_code
    
@app.route("/getchathistory", methods=['POST'])
def get_chat_history():
    
    request_required_fields = ["hash_plain_text"]
    return_request = {
        "status": False,
        "message": "",
        "message_count": None,
        "chat_history": [],
        
    }
    status_code = 401
    try:
        
        #validate that all required fields are present in request
        data = request.json
        if check_missing_or_blank_fields(data, request_required_fields):
             
            raise ValueError("request missing fields")

        #validate hash exists
        hash = data["hash_plain_text"]
        chat_doc = mongo.db.chats.find_one({"_id": hash})
        if not chat_doc:
            raise ValueError("Chat with given hash doesnt exsist")
        
        
        #get chat
        #print(chat_doc)
        return_request["chat_history"] = chat_doc["chat_history"]
        return_request["message_count"] = chat_doc["message_count"]
        return_request["message"] = "Succesfully retireved messsage histoy"
        return_request["status"] = True
        status_code = 200
        
    except Exception as e:
        print(e)
        status_code = 500
        return_request["message"] = str(e)
        
    finally:
        return jsonify(return_request), status_code
    
@app.route("/prompt", methods=['POST'])
def prompt():
    
    request_required_fields = ["hash_plain_text", "user_message"]
    return_request = {
        "status": False,
        "user_message": "",
        "llm_response": "",
        "updated_search_string": ""
        
    }
    status_code = 401
    try:
        
        #validate that all required fields are present in request
        data = request.json
        if check_missing_or_blank_fields(data, request_required_fields):
             
            raise ValueError("request missing fields")

        #validate hash exists
        hash = data["hash_plain_text"]
        chat_doc = mongo.db.chats.find_one(
            {"_id": hash},
            {"chat_history": 0}
        )

        current_search_string = chat_doc.get("current_search_string", "")

        if not chat_doc:
            raise ValueError("Chat with given hash doesnt exsist")
        
        #Flow chart the type of prompt, is this the research question or a followup?(check db current search string field)
        paper_context = ""
        base_prompt = ""
        followup_prompt = ""
        user_input = f'User Input: {data["user_message"]} \n \n'
        end_specification = open("helpers/llm/prompts/specificationFollowup.txt", "r").read()
        if current_search_string == "" or current_search_string == " ":
            paper_context = "" 
            base_prompt = open("helpers/llm/prompts/baseQuestionPrompt.txt", "r").read()

        else: #query IEEE xplore this is a question followup
            base_prompt = open("helpers/llm/prompts/baseFollowupPrompt.txt", "r").read()
            paper_context = f'Current search string: {current_search_string} \n \n'
        
        
        
        prompt = Prompt()
        prompt.append_item(base_prompt)
        prompt.append_item(paper_context)
        prompt.append_item(followup_prompt)
        prompt.append_item(user_input)
        prompt.append_item(end_specification)
        full_prompt = prompt.get_prompt_as_str()
        print()
        print(full_prompt)
        print()
        #callin llm
        llm_response = json.loads(pu.call_gemini(gemini_key, full_prompt))
        updated_search_string = llm_response["updated_search_string"]
        if llm_response["has_chaged"]:
            updated_search_string = llm_response["updated_search_string"]
        else:
            updated_search_string = current_search_string
        
        #create new message to store in db
        new_db_message = {
            "user_message": data["user_message"],
            "llm_response": llm_response["text"],
            "message_dt": datetime.datetime.now(),
            "message_number": int(chat_doc["message_count"]) + 1,
            "search_string": updated_search_string  
        }
        
        # Update the chat document: push new message, update message count and last use
        mongo.db.chats.update_one(
            {"_id": hash},
            {
                "$push": {"chat_history": new_db_message},
                "$set": {
                    "chat_last_use": datetime.datetime.now(),
                    "message_count": int(chat_doc["message_count"]) + 1,
                    "current_search_string": updated_search_string
                }
            }
        )
        
        
        
        #finalize finished return json
        return_request["llm_response"] = llm_response["text"]
        return_request["user_message"] = data["user_message"]
        return_request["updated_search_string"] = updated_search_string
        return_request["status"] = True
        status_code = 200
        #return the llm respnse to the user
    except Exception as e:
        print(e)
        status_code = 500
        return_request["message"] = str(e)
        
    finally:
        return jsonify(return_request), status_code
    
    
def check_missing_or_blank_fields(data, request_required_fields):
    '''returns true if a field is missing or is blank in the data json given from request'''
    if any(field not in data or data.get(field) in ["", None] for field in request_required_fields):
        return True
    return False