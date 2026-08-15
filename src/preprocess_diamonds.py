import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import sys

# Make sure we can import from src when run as a script or imported
try:
    from src.config import RANDOM_STATE, CUT_ORDER, COLOR_ORDER, CLARITY_ORDER
except ModuleNotFoundError:
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from src.config import RANDOM_STATE, CUT_ORDER, COLOR_ORDER, CLARITY_ORDER

def understand_data(df, plot_dir="./notebooks/sajini/eda_plots/"):
    """
    Part 1: Data Understanding
    - Print shape, dtypes, summary
    - Count missing values, duplicate rows
    - Identify invalid rows
    - Visualize distributions and relationships
    """
    print("--- Data Understanding ---")
    print(f"\nShape: {df.shape}")
    print("\nData Types:\n", df.dtypes)
    print("\nSummary:\n", df.describe())
    
    print("\nMissing values per column:\n", df.isnull().sum())
    print("\nDuplicate rows:", df.duplicated().sum())
    
    # Identify obviously invalid rows
    invalid_mask = (df['x'] == 0) | (df['y'] == 0) | (df['z'] == 0) | (df['depth'] == 0) | (df['price'] <= 0)
    print(f"\nObviously invalid rows (x, y, z, or depth == 0, or price <= 0): {invalid_mask.sum()}")
    
    # Visualization
    os.makedirs(plot_dir, exist_ok=True)
    
    # 1. Price distribution histogram
    plt.figure(figsize=(8, 5))
    sns.histplot(df['price'], bins=50, kde=True)
    plt.title('Price Distribution')
    plt.savefig(os.path.join(plot_dir, 'price_distribution.png'))
    plt.close()
    
    # 2. Carat vs Price scatterplot
    plt.figure(figsize=(8, 5))
    sns.scatterplot(x='carat', y='price', data=df, alpha=0.5)
    plt.title('Carat vs Price')
    plt.savefig(os.path.join(plot_dir, 'carat_vs_price.png'))
    plt.close()
    
    # 3. Boxplots for carat, depth, table
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    sns.boxplot(y=df['carat'], ax=axes[0]).set_title('Carat')
    sns.boxplot(y=df['depth'], ax=axes[1]).set_title('Depth')
    sns.boxplot(y=df['table'], ax=axes[2]).set_title('Table')
    plt.tight_layout()
    plt.savefig(os.path.join(plot_dir, 'boxplots.png'))
    plt.close()
    
    # 4. Correlation heatmap
    plt.figure(figsize=(10, 8))
    numeric_df = df.select_dtypes(include=[np.number])
    sns.heatmap(numeric_df.corr(), annot=True, cmap='coolwarm', fmt=".2f")
    plt.title('Correlation Heatmap')
    plt.savefig(os.path.join(plot_dir, 'correlation_heatmap.png'))
    plt.close()
    print(f"\nPlots saved to {plot_dir}")


def preprocess_data(df):
    """
    Part 2: Preprocessing
    - Remove duplicates and invalid values
    - Handle outliers
    - Encode categorical features as ordinal integers
    """
    initial_shape = df.shape
    initial_columns = df.columns.tolist()
    
    print("\n--- Preprocessing ---")
    
    # 1. Remove duplicate rows
    df = df.drop_duplicates().copy()
    
    # 2. Remove invalid/impossible values
    invalid_mask = (df['x'] == 0) | (df['y'] == 0) | (df['z'] == 0) | (df['depth'] == 0) | (df['price'] <= 0)
    df = df[~invalid_mask].copy()
    
    # 3. Handle outliers in carat and price using IQR method
    def get_outliers_iqr(col):
        q1 = col.quantile(0.25)
        q3 = col.quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        return (col < lower_bound) | (col > upper_bound)
    
    outliers_carat = get_outliers_iqr(df['carat'])
    outliers_price = get_outliers_iqr(df['price'])
    
    combined_outliers = outliers_carat | outliers_price
    print(f"Removed {combined_outliers.sum()} rows due to outliers in carat or price.")
    
    df = df[~combined_outliers].copy()
    
    # 4. Encode cut, color, clarity as ordinal ints based on config.py
    cut_mapping = {val: i for i, val in enumerate(CUT_ORDER)}
    color_mapping = {val: i for i, val in enumerate(COLOR_ORDER)}
    clarity_mapping = {val: i for i, val in enumerate(CLARITY_ORDER)}
    
    df['cut'] = df['cut'].map(cut_mapping).astype(int)
    df['color'] = df['color'].map(color_mapping).astype(int)
    df['clarity'] = df['clarity'].map(clarity_mapping).astype(int)
    
    print("\n--- Before/After Summary ---")
    print(f"Row count: {initial_shape[0]} -> {df.shape[0]}")
    print(f"Columns: {len(initial_columns)} -> {len(df.columns)}")
    print("\nDtypes after preprocessing:")
    print(df.dtypes)
    
    return df

if __name__ == "__main__":
    # Example execution if run as a script
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(project_root, "data", "diamonds.csv")
    
    if os.path.exists(data_path):
        df = pd.read_csv(data_path)
        if 'Unnamed: 0' in df.columns:
            df = df.drop('Unnamed: 0', axis=1)
            
        plot_dir = os.path.join(project_root, "notebooks", "sajini", "eda_plots")
        understand_data(df, plot_dir=plot_dir)
        
        df_clean = preprocess_data(df)
        
        clean_path = os.path.join(project_root, "data", "diamonds_clean.csv")
        df_clean.to_csv(clean_path, index=False)
        print(f"\nCleaned dataset saved to {clean_path}")
    else:
        print(f"Dataset not found at {data_path}")
