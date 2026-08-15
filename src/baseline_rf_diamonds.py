import pandas as pd
import numpy as np
import time
import json
import os
import sys
import pickle
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

try:
    from src.config import RANDOM_STATE, TEST_SIZE
except ModuleNotFoundError:
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from src.config import RANDOM_STATE, TEST_SIZE

def run_baseline():
    print("--- Baseline Random Forest (Diamonds Dataset) ---")
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(project_root, 'data', 'diamonds_clean.csv')
    
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return
        
    # 1. Load data
    df = pd.read_csv(data_path)
    print(f"Loaded dataset: {df.shape}")
    
    # Separate features and target
    X = df.drop('price', axis=1)
    y = df['price']
    
    # 2. Split train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    print(f"Train shape: {X_train.shape}, Test shape: {X_test.shape}")
    
    # 3. Train RF
    print("Training RandomForestRegressor...")
    rf = RandomForestRegressor(n_estimators=100, random_state=RANDOM_STATE, n_jobs=-1)
    
    start_time = time.time()
    rf.fit(X_train, y_train)
    end_time = time.time()
    training_time = end_time - start_time
    
    # 4. Evaluate
    print("Evaluating model...")
    y_pred = rf.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    # 5. Print summary
    print("\n--- Model Metrics ---")
    print(f"RMSE: {rmse:.4f}")
    print(f"MAE:  {mae:.4f}")
    print(f"R²:   {r2:.4f}")
    print(f"Training Time: {training_time:.2f} seconds")
    
    # 6. Save results
    results_dir = os.path.join(project_root, 'results')
    os.makedirs(results_dir, exist_ok=True)
    
    # Save model
    model_path = os.path.join(results_dir, 'baseline_rf.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(rf, f)
    
    # Save metrics
    metrics = {
        'RMSE': rmse,
        'MAE': mae,
        'R2': r2,
        'training_time': training_time,
        'n_features_used': X_train.shape[1],
        'feature_list': X_train.columns.tolist()
    }
    metrics_path = os.path.join(results_dir, 'baseline_rf.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=4)
        
    # 7. Plot feature importance
    importance = rf.feature_importances_
    sorted_idx = np.argsort(importance)[::-1]
    sorted_features = [X.columns[i] for i in sorted_idx]
    sorted_importance = importance[sorted_idx]
    
    plt.figure(figsize=(10, 6))
    sns.barplot(x=sorted_importance, y=sorted_features, orient='h')
    plt.title('Baseline Random Forest Feature Importance')
    plt.xlabel('Importance')
    plt.ylabel('Feature')
    plt.tight_layout()
    plot_path = os.path.join(results_dir, 'baseline_rf_feature_importance.png')
    plt.savefig(plot_path)
    plt.close()
    
    print(f"\nSaved model to {model_path}")
    print(f"Saved metrics to {metrics_path}")
    print(f"Saved plot to {plot_path}")

if __name__ == "__main__":
    run_baseline()
