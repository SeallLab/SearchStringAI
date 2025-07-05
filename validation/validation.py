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
    required_cols = ['search_string', 'bot_generated_search_string', 'bot_generated_search_string_followup']
    for col in required_cols:
        if col not in df.columns :
            raise ValueError(f"Excel file must contain {col}")

    # Prepare new columns
    jaccard_scores = []
    jaccard_scores_followup = []
    ss_word_lists = []
    bot_word_lists = []
    bot_word_lists_followup = []
    print("Row # Jaccard Similarity: (base_str to bot_str, base_str to bot_followup_str)")
    for idx, row in df.iterrows():


        ss1_raw = ss_to_words(str(row['search_string']))
        ss2_raw = ss_to_words(str(row['bot_generated_search_string']))
        ss3_raw = ss_to_words(str(row['bot_generated_search_string_followup']))

        ss1 = sorted(ss1_raw)
        ss2 = sorted(ss2_raw)
        ss3 = sorted(ss3_raw)

        sim1 = jaccard_similarity(ss1, ss2)
        sim2 = jaccard_similarity(ss1, ss3)
        print(f"Row {idx} similarity: {sim1}, {sim2}")

        jaccard_scores.append(sim1)
        jaccard_scores_followup.append(sim2)
        ss_word_lists.append(ss1)
        bot_word_lists.append(ss2)
        bot_word_lists_followup.append(ss3)

    # Add new columns to DataFrame
    df['ss_words'] = ss_word_lists
    df['bot_gen_ss_words'] = bot_word_lists
    df['jaccard_similarity'] = jaccard_scores
    df['jaccard_scores_followup'] = jaccard_scores_followup

    # Save back to the same Excel file
    df.to_excel(excel_path, index=False)

    # Compute and print average similarity
    avg1 = average_jaccard_score(jaccard_scores)
    avg2 = average_jaccard_score(jaccard_scores_followup)

    print(f"\nAverage Jaccard Similarity: {avg1}")
    print(f"Average Jaccard Similarity for followup: {avg2}")
    print()

def average_jaccard_score(scores):
    if scores:
        avg = sum(scores) / len(scores)
        
        return avg
    else:
        return -1

if __name__ == "__main__":
    file = "final_paper_selection.xlsx"
    compute_jaccard_column(file)
