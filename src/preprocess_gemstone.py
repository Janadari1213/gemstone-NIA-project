import pandas as pd
import numpy as np
import os
import sys

# Ensure we can import from src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.config import CUT_ORDER, COLOR_ORDER, CLARITY_ORDER

def preprocess_cubic_zirconia(input_path='./data/cubic_zirconia.csv', output_path='./data/gemstone_clean.csv'):
    print(f"Loading data from {input_path}...")
    df = pd.read_csv(input_path)
    
    print("\n--- BEFORE PREPROCESSING ---")
    print(f"Row count: {len(df)}")
    print(f"Columns: {list(df.columns)}")
    print(f"Data types:\n{df.dtypes}\n")
    
    # 1. Drop redundant index column
    if 'Unnamed: 0' in df.columns:
        df = df.drop(columns=['Unnamed: 0'])
        print("Dropped 'Unnamed: 0' column.")
        
    # 2. Handle missing values
    # The 'depth' column has known missing values.
    initial_null_depth = df['depth'].isnull().sum()
    if initial_null_depth > 0:
        depth_median = df['depth'].median()
        df['depth'] = df['depth'].fillna(depth_median)
        print(f"Imputed {initial_null_depth} missing values in 'depth' with median ({depth_median:.2f}).")
        
    # 3. Handle duplicate rows
    initial_len = len(df)
    df = df.drop_duplicates()
    duplicates_removed = initial_len - len(df)
    print(f"Removed {duplicates_removed} duplicate rows.")
    
    # 4. Remove invalid/impossible rows (x, y, z, depth == 0 or price <= 0)
    invalid_mask = (df['x'] == 0) | (df['y'] == 0) | (df['z'] == 0) | (df['depth'] == 0) | (df['price'] <= 0)
    invalid_count = invalid_mask.sum()
    df = df[~invalid_mask]
    print(f"Removed {invalid_count} rows with invalid dimensions (0) or price (<=0).")
    
    # 5. Handle outliers in 'carat' and 'price' using IQR
    def remove_outliers_iqr(data, col):
        Q1 = data[col].quantile(0.25)
        Q3 = data[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        outliers_mask = (data[col] < lower_bound) | (data[col] > upper_bound)
        return data[~outliers_mask], outliers_mask.sum()

    df, carat_outliers = remove_outliers_iqr(df, 'carat')
    df, price_outliers = remove_outliers_iqr(df, 'price')
    print(f"Removed {carat_outliers} outliers from 'carat'.")
    print(f"Removed {price_outliers} outliers from 'price'.")
    
    # 6. Encode cut, color, clarity ordinally
    df['cut'] = df['cut'].map({k: i for i, k in enumerate(CUT_ORDER)})
    df['color'] = df['color'].map({k: i for i, k in enumerate(COLOR_ORDER)})
    df['clarity'] = df['clarity'].map({k: i for i, k in enumerate(CLARITY_ORDER)})
    print("Encoded 'cut', 'color', and 'clarity' as ordinal integers.")
    
    print("\n--- AFTER PREPROCESSING ---")
    print(f"Row count: {len(df)}")
    print(f"Columns: {list(df.columns)}")
    print(f"Data types:\n{df.dtypes}\n")
    
    # Save cleaned dataset
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Cleaned dataset saved to {output_path}")
    
    return df

if __name__ == "__main__":
    preprocess_cubic_zirconia()
