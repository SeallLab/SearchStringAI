import pandas as pd
import re

def ss_to_words(search_string):
    kill_list = {'(', ')', '{', '}', '[', ']', '\n', '\t'}
    letter_list = [char for char in search_string if char not in kill_list]
    parts = re.split(r"(?i)\s+(?:and|or)\s+", ''.join(letter_list))

    for i in range(len(parts)):
        word = parts[i]
        word = word.strip(' ''"').lower()
        parts[i] = word

    return parts

def jaccard_similarity(term_list_1, term_list_2):
    combined_unique_terms = set(term_list_1 + term_list_2)
    common_terms = set(term_list_1) & set(term_list_2)
    return len(common_terms) / len(combined_unique_terms)

def compute_jaccard_column(excel_path):
    # Load the Excel file into a DataFrame
    df = pd.read_excel(excel_path)

    # Check that required columns exist
    if 'search_string' not in df.columns or 'bot_generated_search_string' not in df.columns:
        raise ValueError("Excel file must contain 'search_string' and 'bot_generated_search_string' columns")

    # Prepare new columns
    jaccard_scores = []
    ss_word_lists = []
    bot_word_lists = []

    for idx, row in df.iterrows():
        ss1_raw = ss_to_words(str(row['search_string']))
        ss2_raw = ss_to_words(str(row['bot_generated_search_string']))

        ss1 = sorted(ss1_raw)
        ss2 = sorted(ss2_raw)

        sim = jaccard_similarity(ss1, ss2)
        print(f"Row {idx} similarity: {sim:.3f}")

        jaccard_scores.append(sim)
        ss_word_lists.append(ss1)
        bot_word_lists.append(ss2)

    # Add new columns to DataFrame
    df['ss_words'] = ss_word_lists
    df['bot_gen_ss_words'] = bot_word_lists
    df['jaccard_similarity'] = jaccard_scores

    # Save back to the same Excel file
    df.to_excel(excel_path, index=False)

    # Compute and print average similarity
    average_jaccard_score(jaccard_scores)

def average_jaccard_score(scores):
    if scores:
        avg = sum(scores) / len(scores)
        print(f"\nAverage Jaccard Similarity: {avg}")
    else:
        print("No scores available to compute average.")

if __name__ == "__main__":
    file = "final_paper_selection.xlsx"
    compute_jaccard_column(file)
