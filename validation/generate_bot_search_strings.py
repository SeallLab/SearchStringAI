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

def generate_bot_search_strings(excel_path, bot_followup_prompt):
    # Load the Excel file
    df = pd.read_excel(excel_path)

    # Ensure the necessary columns exist
    if 'research_question' not in df.columns or 'objective' not in df.columns:
        raise ValueError("The Excel file must contain 'research_question' and 'objective' columns.")

    new_columns = ['bot_generated_search_string',  'followup_prompt', 'bot_generated_search_string_followup']
    # Create the new column if it doesn't exist
    for col_name in new_columns:
        if col_name not in df.columns:
            df[col_name] = ""

    # Iterate over the DataFrame and populate the new column with new generated strings
    for index, row in df.iterrows():
        research_question = str(row['research_question'])
        objective = str(row['objective'])

        # Combine both fields into one prompt
        full_prompt = f"{objective} {research_question}"

        try:
            chat_hash = get_new_chat()
            print(f'Making prompts for paper {index}')
            bot_string = prompt_bot_for_search_string(full_prompt, chat_hash)
            bot_string_followup = prompt_bot_for_search_string(bot_followup_prompt, chat_hash)
            print(chat_hash, flush=True)
            print()
        except Exception as e:
            print(f"Error at row {index}: {e}")
            bot_string = ""

        df.at[index, 'bot_generated_search_string'] = bot_string
        df.at[index, 'bot_generated_search_string_followup'] = bot_string_followup

    # Save the updated DataFrame back to the same file
    df.to_excel(excel_path, index=False)
    print("saved succesfully to file")


if __name__ == "__main__":
    file = "final_paper_selection.xlsx"
    followup_prompt = "Add more keyword varients. For the phrases of multiple words, add split up versions and combinations"
    generate_bot_search_strings(file, followup_prompt)
