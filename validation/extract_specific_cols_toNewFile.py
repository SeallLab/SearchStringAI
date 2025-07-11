import pandas as pd

# Define the path to your Excel file
input_file = 'final_paper_selection.xlsx'  
output_file = 'filtered_output.xlsx'

# Define the desired columns to extract
columns_to_keep = [
    "Paper Title",
    "search_string",
    "bot_generated_search_string",
    "bot_generated_search_string_followup",
    "jaccard_similarity",
    "jaccard_scores_followup"
]

# Read the Excel file
df = pd.read_excel(input_file)

# Filter only the desired columns (skip missing ones gracefully)
filtered_df = df[[col for col in columns_to_keep if col in df.columns]]

# Save to a new Excel file
filtered_df.to_excel(output_file, index=False)

print(f"Filtered data saved to: {output_file}")
