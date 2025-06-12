import google.generativeai as genai


def call_gemini(api_key: str, prompt: str) -> str:
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=prompt
    )

    return response

