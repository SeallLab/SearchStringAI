import pandas as pd
import random

def strID_to_int(id_str):
    """
    Takes the dataset's string ID and returns just the int version.
    Example: 'SLR-000123456' → 123456
    """
    id = id_str.split("-")[1].lstrip("0")
    return int(id)

def copy_random_rows(input_file, output_file, num_rows=5, rs=42):
    """
    Reads an Excel file, randomly samples rows, and saves to a new Excel file.
    """
    df = pd.read_excel(input_file)

    total_rows = len(df)
    print(f"Total rows in file: {total_rows}")
    num_rows = min(num_rows, total_rows)

    sampled_df = df.sample(n=num_rows, random_state=rs)

    if 'ID' not in sampled_df.columns:
        raise KeyError("Column 'ID' not found in sampled data.")

    # Save the sampled data without modifying IDs yet
    sampled_df.to_excel(output_file, index=False)
    print(f"Randomly copied {num_rows} rows to '{output_file}'.")

def modify_id_column(input_file, output_file):
    """
    Reads an Excel file, converts the 'ID' column to int using custom logic,
    and saves the updated data to a new Excel file.
    """
    df = pd.read_excel(input_file)

    if 'ID' not in df.columns:
        raise KeyError("Column 'ID' not found.")

    df['ID'] = df['ID'].apply(strID_to_int)

    df.to_excel(output_file, index=False)
    print(f"'ID' column converted to integers and saved to '{output_file}'.")

def sort_by_id(input_file, output_file):
    """
    Reads an Excel file, sorts rows by the 'ID' column ascending,
    and saves the sorted data to a new Excel file.
    """
    df = pd.read_excel(input_file)
    
    if 'ID' not in df.columns:
        raise KeyError("Column 'ID' not found.")
    
    df_sorted = df.sort_values(by='ID', ascending=True)
    df_sorted.to_excel(output_file, index=False)
    print(f"Data sorted by 'ID' and saved to '{output_file}'.")

# ====== RUN SCRIPT ======
if __name__ == "__main__":
    # Step 1: Sample rows
    input_excel = "dataset/final_dataset-June-2023.xlsx"
    sampled_excel = "selectedPapers.xlsx"
    modified_output = "selectedPapers.xlsx"
    sorted_output = "selectedPapers.xlsx"
    


    rows_to_copy = 25

    copy_random_rows(input_excel, sampled_excel, rows_to_copy)

    modify_id_column(sampled_excel, modified_output)

    sort_by_id(modified_output, sorted_output)