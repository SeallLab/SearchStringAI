from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_pymongo import PyMongo
import os, json, datetime
from helpers.xploreapi.xploreapi import XPLORE #for thee IEEE xPlore API
import helpers.scholarlyapi as sa #This is for querying and getting paper abstracts
import helpers.cryptographic_helpers as ch #Generating chat hashes
from helpers.llm.promptBuilder import Prompt #for building prompts
import helpers.llm.llmPromptingUtils as pu #for actually calling the AI API
# from google.genai.types import HttpOptions



app = Flask(__name__)
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)
CORS(app)
hash_byte_length = 16
chat_hash_length = 8
gemini_key = os.getenv('GEMINI_API_KEY')
gpt_key = os.getenv('GPT_API_KEY')


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
        existing = mongo.db.search_string_chats.find_one({"_id": hash})
        if existing:
            raise ValueError("whoops, something went wrong. Try creating a new chat again")

        
        #create new messege history related to the hash in db
        new_search_string_chat = {
            "_id": hash,  
            "chat_creation_date": datetime.datetime.now(),
            "chat_last_use": datetime.datetime.now(),
            "chat_history": [],
            "message_count": 0,
            "current_search_string": "",
            "current_search_string_format": ""
        }

        new_creteria_chat = {
            "_id": hash,  
            "chat_creation_date": datetime.datetime.now(),
            "chat_last_use": datetime.datetime.now(),
            "chat_history": [],
            "message_count": 0,
            "current_criteria": "",
        }
        
        mongo.db.search_string_chats.insert_one(new_search_string_chat)
        mongo.db.criteria_chats.insert_one(new_creteria_chat)
        
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
        chat_doc = mongo.db.search_string_chats.find_one({"_id": hash})
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
        "ai_used": "",
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
        chat_doc = mongo.db.search_string_chats.find_one(
            {"_id": hash},
            {"chat_history": 0}
        )
        if not chat_doc:
            raise ValueError("Chat with given hash doesnt exsist")

        current_search_string = chat_doc.get("current_search_string", "")
        current_search_string_format = chat_doc.get("current_search_string_format", "")
        
        
        #Flow chart the type of prompt, is this the research question or a followup?(check db current search string field)
        paper_context = ""
        base_prompt = ""
        # Read all prompt components using UTF-8 to prevent decode issues
        with open("helpers/llm/prompts/identifyingKeyWordsPrompt.txt", "r", encoding="utf-8") as f:
            identify_kw_prompt = f.read()

        with open("helpers/llm/prompts/userInputPrompt.txt", "r", encoding="utf-8") as f:
            user_input_prompt = f.read()

        with open("helpers/llm/prompts/specificationFollowup.txt", "r", encoding="utf-8") as f:
            end_specification = f.read()
        

        user_input = f'User Input: {data["user_message"]} \n \n'
        if current_search_string.strip() == "":
            with open("helpers/llm/prompts/baseQuestionPrompt.txt", "r", encoding="utf-8") as f:
                base_prompt = f.read()
            paper_context = ""
            current_search_string_format = "General"
        else:
            with open("helpers/llm/prompts/baseFollowupPrompt.txt", "r", encoding="utf-8") as f:
                base_prompt = f.read()

            paper_context = f'Current search string: {current_search_string} \n \n'
            with open("helpers/llm/prompts/conversion/3_formatContext.txt", "r", encoding="utf-8") as f:
                user_input_context = f.read()
            with open("helpers/llm/prompts/conversion/" + str(valid_ss_conversions.get(current_search_string_format, valid_ss_conversions["General"])), "r", encoding="utf-8") as f:
                current_format = f.read()
            paper_context = paper_context + user_input_context + current_format

            abstracts = sa.get_abstracts_semantic_scholar(5, current_search_string)
            if isinstance(abstracts, str): #if there was no error getting the abstracts
                paper_context = paper_context + f'\n \nHere is the tittles and abstracts returned by the current search string for context: \n' + abstracts 

            

        
        
        
        prompt = Prompt()
        prompt.append_item(base_prompt)
        prompt.append_item(paper_context)
        prompt.append_item(identify_kw_prompt)
        prompt.append_item(user_input_prompt)
        prompt.append_item(user_input)
        prompt.append_item(end_specification)
        full_prompt = prompt.get_prompt_as_str()
        
        #callin llm
        llm_response = {}
        ai_used = ""
        try:
            llm_response = pu.call_gemini(gemini_key, full_prompt)
            ai_used = "Gemini"

        except Exception as e:
            print(f"Gemini call failed, falling back to ChatGPT: {e}")
            llm_response = pu.call_chatgpt(gpt_key, full_prompt)
            ai_used = "chatGPT"


            

        updated_search_string = llm_response["updated_search_string"]
        if not llm_response["has_chaged"]:
            updated_search_string = current_search_string
        
        #create new message to store in db
        new_db_message = {
            "user_message": data["user_message"],
            "llm_response": llm_response["text"],
            "message_dt": datetime.datetime.now(),
            "message_number": int(chat_doc["message_count"]) + 1,
            "search_string": updated_search_string,  
            "search_string_format": current_search_string_format
        }
        
        # Update the chat document: push new message, update message count and last use
        mongo.db.search_string_chats.update_one(
            {"_id": hash},
            {
                "$push": {"chat_history": new_db_message},
                "$set": {
                    "chat_last_use": datetime.datetime.now(),
                    "message_count": int(chat_doc["message_count"]) + 1,
                    "current_search_string": updated_search_string,
                    "current_search_string_format": current_search_string_format
                }
            }
        )
        
        
        
        #finalize finished return json
        return_request["llm_response"] = llm_response["text"]
        return_request["user_message"] = data["user_message"]
        return_request["updated_search_string"] = updated_search_string
        return_request["ai_used"] = ai_used
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

valid_ss_conversions = {"General":"4_generalformat.txt", "IEEE Xplore":"4_ieeeXploreformat.txt", "Google Scholar":"4_googlescholarformat.txt"}
@app.route("/conversionformats", methods=['GET'])
def get_conversionformats():
    return_request = {
        "formats": valid_ss_conversions.keys()
    }
    return return_request

@app.route("/convertsearchstring", methods=['POST'])
def convert():
    request_required_fields = ["hash_plain_text", "conversion_format"]
    return_request = {
        "status": False,
        "ai_used": "",
        "user_message": "",
        "llm_response": "",
        "updated_search_string": "",
        "current_format": "" 
    }
    
    status_code = 401
    try:
        
        
        #validate that all required fields are present in request66
        data = request.json
        if check_missing_or_blank_fields(data, request_required_fields):
            raise ValueError("request missing fields")

        #Basic error checking
        if str(data["conversion_format"]).strip() not in valid_ss_conversions:
            raise ValueError("conversion search string format not recognized")
        
        
        #retrieving the current format from the DB
        hash = str(data["hash_plain_text"])
        chat_doc = mongo.db.search_string_chats.find_one(
            {"_id": hash},
            {"chat_history": 0}
        )
        #validate hash exists
        if not chat_doc:
            raise ValueError("Chat with given hash doesnt exsist")
        
        #getting the current latest search string and format
        current_search_string = chat_doc.get("current_search_string", "")
        current_search_string_format = chat_doc["current_search_string_format"]
        #validating the format exists and is different then the format to be converted to
        if str(current_search_string_format).strip() not in valid_ss_conversions:
            raise ValueError("current search string format not recognized")
        if str(data["conversion_format"]).strip() == current_search_string_format:
            raise ValueError("Conversion format must be different then current format")
        
        #getting prompt files and strs ready
        with open("helpers/llm/prompts/conversion/1_BasePrompt.txt", "r", encoding="utf-8") as f:
            base_prompt = f.read()       
        with open("helpers/llm/prompts/conversion/2_userInputPrompt.txt", "r", encoding="utf-8") as f:
            user_input_prompt = f.read()
        search_string = f'User Input: {current_search_string} \n \n'
        
        with open("helpers/llm/prompts/conversion/3_formatContext.txt", "r", encoding="utf-8") as f:
            user_input_context = f.read()
        with open("helpers/llm/prompts/conversion/" + str(valid_ss_conversions[current_search_string_format]), "r", encoding="utf-8") as f:
            current_format = f.read()
            
        with open("helpers/llm/prompts/conversion/5_conversionContext.txt", "r", encoding="utf-8") as f:
            convert_to_context = f.read()
        with open("helpers/llm/prompts/conversion/" + str(valid_ss_conversions[data["conversion_format"]]).strip(), "r", encoding="utf-8") as f:
            convert_to_format = f.read()
        
        
        with open("helpers/llm/prompts/conversion/specificationFollowup.txt", "r", encoding="utf-8") as f:
            end_specification = f.read()
        
        prompt = Prompt()
        prompt.append_item(base_prompt)
        prompt.append_item(user_input_prompt)
        prompt.append_item(search_string)
        prompt.append_item(user_input_context)
        prompt.append_item(current_format)
        prompt.append_item(convert_to_context)
        prompt.append_item(convert_to_format)
        prompt.append_item(end_specification)
        
        full_prompt = prompt.get_prompt_as_str()
        
        #calling LLM
        llm_response = {}
        ai_used = ""
        try:
            llm_response = pu.call_gemini(gemini_key, full_prompt)
            ai_used = "Gemini"

        except Exception as e:
            print(f"Gemini call failed, falling back to ChatGPT: {e}")
            llm_response = pu.call_chatgpt(gpt_key, full_prompt)
            ai_used = "chatGPT"

        updated_search_string = llm_response["updated_search_string"]
        
        #create new message to store in db
        user_message = f'Convert the current search string to the {data["conversion_format"]} format'
        new_db_message = {
            "user_message": user_message,
            "llm_response": llm_response["text"],
            "message_dt": datetime.datetime.now(),
            "message_number": int(chat_doc["message_count"]) + 1,
            "search_string": updated_search_string,  
            "search_string_format": data["conversion_format"]
        }
        
        # Update the chat document: push new message, update message count and last use
        mongo.db.search_string_chats.update_one(
            {"_id": hash},
            {
                "$push": {"chat_history": new_db_message},
                "$set": {
                    "chat_last_use": datetime.datetime.now(),
                    "message_count": int(chat_doc["message_count"]) + 1,
                    "current_search_string": updated_search_string,
                    "current_search_string_format": data["conversion_format"]
                }
            }
        )



        #finalize finished return json
        return_request["llm_response"] = llm_response["text"]
        return_request["user_message"] = user_message
        return_request["updated_search_string"] = updated_search_string
        return_request["current_format"] = data["conversion_format"]
        return_request["ai_used"] = ai_used
        return_request["status"] = True
        status_code = 200
        #return the llm respnse to the user
    except Exception as e:
        print(e)
        status_code = 500
        return_request["message"] = str(e)
        
    finally:
        return jsonify(return_request), status_code


@app.route("/criteria", methods=['POST'])
def criteria():
    
    request_required_fields = ["hash_plain_text", "user_message"]
    return_request = {
        "status": False,
        "ai_used": "",
        "user_message": "",
        "llm_response": "",
        "updated_criteria": ""
    }
    status_code = 401
    try:
        
        #validate that all required fields are present in request
        data = request.json
        if check_missing_or_blank_fields(data, request_required_fields):   
            raise ValueError("request missing fields")

        #validate hash exists
        hash = data["hash_plain_text"]
        chat_doc = mongo.db.criteria_chats.find_one(
            {"_id": hash},
            {"chat_history": 0}
        )
        if not chat_doc:
            raise ValueError("Chat with given hash doesnt exsist")

        current_criteria = chat_doc.get("current_criteria", "")        
        
        #Flow chart the type of prompt, is this the research question or a followup?(check db current search string field)
        paper_context = ""
        base_prompt = ""
        # Read all prompt components using UTF-8 to prevent decode issues
        with open("helpers/llm/prompts/criteria/userInputPrompt.txt", "r", encoding="utf-8") as f:
            user_input_prompt = f.read()

        with open("helpers/llm/prompts/criteria/specificationFollowup.txt", "r", encoding="utf-8") as f:
            end_specification = f.read()
        

        user_input = f'User Input: {data["user_message"]} \n \n'
        if current_criteria.strip() == "":
            with open("helpers/llm/prompts/criteria/baseQuestionPrompt.txt", "r", encoding="utf-8") as f:
                base_prompt = f.read()
            paper_context = ""
        else:
            with open("helpers/llm/prompts/criteria/baseFollowupPrompt.txt", "r", encoding="utf-8") as f:
                base_prompt = f.read()

    
        prompt = Prompt()
        prompt.append_item(base_prompt)
        prompt.append_item(paper_context)
        prompt.append_item(user_input_prompt)
        prompt.append_item(user_input)
        prompt.append_item(end_specification)
        full_prompt = prompt.get_prompt_as_str()
        #callin llm
        llm_response = {}
        ai_used = ""
        try:
            llm_response = pu.call_gemini_criteria(gemini_key, full_prompt)
            ai_used = "Gemini"

        except Exception as e:
            print(f"Gemini call failed, falling back to ChatGPT: {e}")
            llm_response = pu.call_chatgpt_criteria(gpt_key, full_prompt)
            ai_used = "chatGPT"

        updated_inclusion_exclusion_criteria = llm_response["updated_inclusion_exclusion_criteria"]
        if not llm_response["has_chaged"]:
            updated_inclusion_exclusion_criteria = current_criteria
        
        #create new message to store in db
        new_db_message = {
            "user_message": data["user_message"],
            "llm_response": llm_response["text"],
            "message_dt": datetime.datetime.now(),
            "message_number": int(chat_doc["message_count"]) + 1,
            "criteria": updated_inclusion_exclusion_criteria,  
        }
        
        # Update the chat document: push new message, update message count and last use
        mongo.db.criteria_chats.update_one(
            {"_id": hash},
            {
                "$push": {"chat_history": new_db_message},
                "$set": {
                    "chat_last_use": datetime.datetime.now(),
                    "message_count": int(chat_doc["message_count"]) + 1,
                    "current_criteria": updated_inclusion_exclusion_criteria,
                }
            }
        )
        
        
        
        #finalize finished return json
        return_request["llm_response"] = llm_response["text"]
        return_request["user_message"] = data["user_message"]
        return_request["updated_criteria"] = updated_inclusion_exclusion_criteria
        return_request["ai_used"] = ai_used
        return_request["status"] = True
        status_code = 200
        #return the llm respnse to the user
    except Exception as e:
        print(e)
        status_code = 500
        return_request["message"] = str(e)
        
    finally:
        return jsonify(return_request), status_code

@app.route("/getcriteriachathistory", methods=['POST'])
def get_criteria_chat_history():
    
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
        chat_doc = mongo.db.criteria_chats.find_one({"_id": hash})
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