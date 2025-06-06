from google import genai
from helpers.llm.llmReturnFormat import Response


def call_gemini(api_key: str, prompt: str) -> str:
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-2.0-flash", 
        contents=prompt,
        config={
            'response_mime_type': 'application/json',
            'response_schema': Response
        }
    )

    return response.text

