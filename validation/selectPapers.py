import pandas as pd
import random

def copy_random_rows(input_file, output_file, num_rows=5):
 
    df = pd.read_excel(input_file)

    # Total number of available rows
    total_rows = len(df)
    print(f"Total rows in file: {total_rows}")
    num_rows = min(num_rows, total_rows)

    # Randomly sample rows 
    sampled_df = df.sample(n=num_rows, random_state=42)

    # Write to a new Excel file
    sampled_df.to_excel(output_file, index=False)
    print(f"Randomly copied {num_rows} rows to '{output_file}'.")

# ====== RUN SCRIPT ======
if __name__ == "__main__":
    input_excel = "dataset/final_dataset-June-2023.xlsx"            
    output_excel = "randomRows.xlsx"
    rows_to_copy = 25                      # How many random rows to copy

    copy_random_rows(input_excel, output_excel, rows_to_copy)
