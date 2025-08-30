from openai import OpenAI
from google import genai
from helpers.llm.llmReturnFormat import Response, ResponseCriteria
import json

def call_gemini(api_key: str, prompt: str) -> dict:
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-2.0-flash", 
        contents=prompt,
        config={
            'response_mime_type': 'application/json',
            'response_schema': Response
        }
    )

    return json.loads(response.text)

def call_gemini_criteria(api_key: str, prompt: str) -> dict:
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-2.0-flash", 
        contents=prompt,
        config={
            'response_mime_type': 'application/json',
            'response_schema': ResponseCriteria
        }
    )

    return json.loads(response.text)

def call_chatgpt(api_key: str, prompt: str) -> dict:
    client = OpenAI(api_key=api_key)

    try:
        chat_response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Respond with a JSON dictionary in the format: "
                        "{\"text\": str, \"updated_search_string\": str, \"has_chaged\": bool}"
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        content = chat_response.choices[0].message.content.strip()
        #print("RAW GPT RESPONSE:\n", content) #This is a debug statement
        response_dict = json.loads(content)

        # Patch the key to your expected typo
        if "has_changed" in response_dict and "has_chaged" not in response_dict:
            response_dict["has_chaged"] = response_dict.pop("has_changed")

        # Validate using your Response model 
        validated = Response(**response_dict)
        return validated.model_dump()

    except Exception as e:
        print(f"Error: {e}")
        raise

def call_chatgpt_criteria(api_key: str, prompt: str) -> dict:
    client = OpenAI(api_key=api_key)

    try:
        chat_response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Respond with a JSON dictionary in the format: "
                        "{\"text\": str, \"updated_inclusion_exclusion_criteria\": str, \"has_chaged\": bool}"
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        content = chat_response.choices[0].message.content.strip()
        #print("RAW GPT RESPONSE:\n", content) #This is a debug statement
        response_dict = json.loads(content)

        # Patch the key to your expected typo
        if "has_changed" in response_dict and "has_chaged" not in response_dict:
            response_dict["has_chaged"] = response_dict.pop("has_changed")

        # Validate using your Response model 
        validated = Response(**response_dict)
        return validated.model_dump()

    except Exception as e:
        print(f"Error: {e}")
        raise