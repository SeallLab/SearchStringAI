import pandas as pd
import requests

def get_new_chat():
    url = "http://127.0.0.1:5000/createchat"
    response = requests.post(url)
    data = response.json()
    return data["hash"]

def prompt_bot_for_search_string(prompt, hash): 
    url = "http://127.0.0.1:5000/prompt"
    payload = {
        "hash_plain_text": hash, 
        "user_message": prompt
    }

    response = requests.post(url, json=payload)
    data = response.json()
    return data["updated_search_string"]

def generate_bot_search_strings(excel_path):
    # Load the Excel file
    df = pd.read_excel(excel_path)

    # Ensure the necessary columns exist
    if 'research_question' not in df.columns or 'objective' not in df.columns:
        raise ValueError("The Excel file must contain 'research_question' and 'objective' columns.")

    # Create the new column if it doesn't exist
    if 'bot_generated_search_string' not in df.columns:
        df['bot_generated_search_string'] = ""

    # Iterate over the DataFrame and populate the new column
    for index, row in df.iterrows():
        research_question = str(row['research_question'])
        objective = str(row['objective'])

        # Combine both fields into one prompt
        full_prompt = f"{objective} {research_question}"

        try:
            chat_hash = get_new_chat()
            bot_string = prompt_bot_for_search_string(full_prompt, chat_hash)
            print(bot_string, flush=True)
            print()
        except Exception as e:
            print(f"Error at row {index}: {e}")
            bot_string = ""

        df.at[index, 'bot_generated_search_string'] = bot_string

    # Save the updated DataFrame back to the same file
    df.to_excel(excel_path, index=False)
    print("saved succesfully to file")


if __name__ == "__main__":
    file = "final_paper_selection.xlsx"
    generate_bot_search_strings(file)
