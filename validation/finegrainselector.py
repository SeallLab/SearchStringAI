import pandas as pd

def select_valid_entries(file_path, output_file_name):
    # Load the Excel file
    df = pd.read_excel(file_path)

    # Ensure relevant columns exist
    required_cols = [
        'number_of_research_questions', 
        'number_of_search_strings', 
        'research_question', 
        'search_string',
        'notes',
        'objective'
    ]
    for col in required_cols:
        if col not in df.columns:
            raise ValueError(f"Missing required column: '{col}'")

    # Apply all conditions for valid data entries (have to have 1 search string, cant have notes(this means its a wired entry), have to have the research questions, etc.)
    valid_rows = df[
        df['number_of_research_questions'].notna() &
        pd.to_numeric(df['number_of_research_questions'], errors='coerce').notna() &

        df['number_of_search_strings'].notna() &
        (df['number_of_search_strings'] == 1) &
        (df['number_of_search_strings'] != '.') &

        df['research_question'].notna() &
        (df['research_question'].astype(str).str.strip() != '') &
        (df['research_question'].astype(str).str.strip() != ',') &

        df['search_string'].notna() &
        (df['search_string'].astype(str).str.strip() != '') &
        (df['search_string'].astype(str).str.strip() != '.') &

        (
            df['notes'].isna() |
            (df['notes'].astype(str).str.strip() == '')
        )
    ]

    print(f"Number of valid entries: {len(valid_rows)}")

    # Save the valid entries to a new Excel file
    valid_rows.to_excel(output_file_name, index=False)



if __name__ == "__main__":
    
    input_file = "dataset/final_dataset-June-2023-modified.xlsx"
    output_file_name = "final_paper_selection.xlsx"

    select_valid_entries(input_file, output_file_name)
