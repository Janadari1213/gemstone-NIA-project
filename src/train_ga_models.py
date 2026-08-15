import os
import sys
import json
import time
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

from src.config import RANDOM_STATE, TEST_SIZE

def main():
    # 1. Load ga_selected_features.json
    results_dir = os.path.join(project_root, 'results')
    ga_json_path = os.path.join(results_dir, 'ga_selected_features.json')
    
    with open(ga_json_path, 'r') as f:
        ga_data = json.load(f)
        
    selected_features = ga_data['selected_features']
    ga_fitness_score = ga_data.get('best_fitness', None)
    
    # 2. Load diamonds_clean.csv and split
    data_path = os.path.join(project_root, 'data', 'diamonds_clean.csv')
    df = pd.read_csv(data_path)
    
    X = df[selected_features]
    y = df['price']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    
    # 3. Train models
    print(f"Training models with {len(selected_features)} GA-selected features...")
    
    # Random Forest
    print("Training GA+RF...")
    rf_model = RandomForestRegressor(n_estimators=100, random_state=RANDOM_STATE, n_jobs=-1)
    t0 = time.time()
    rf_model.fit(X_train, y_train)
    rf_time = time.time() - t0
    
    rf_pred = rf_model.predict(X_test)
    rf_rmse = np.sqrt(mean_squared_error(y_test, rf_pred))
    rf_mae = mean_absolute_error(y_test, rf_pred)
    rf_r2 = r2_score(y_test, rf_pred)
    
    # XGBoost
    print("Training GA+XGBoost...")
    xgb_model = XGBRegressor(n_estimators=100, learning_rate=0.1, random_state=RANDOM_STATE)
    t0 = time.time()
    xgb_model.fit(X_train, y_train)
    xgb_time = time.time() - t0
    
    xgb_pred = xgb_model.predict(X_test)
    xgb_rmse = np.sqrt(mean_squared_error(y_test, xgb_pred))
    xgb_mae = mean_absolute_error(y_test, xgb_pred)
    xgb_r2 = r2_score(y_test, xgb_pred)
    
    # 4. Measure and record
    ga_models_results = {
        "ga_rf": {
            "rmse": float(rf_rmse),
            "mae": float(rf_mae),
            "r2": float(rf_r2),
            "training_time": float(rf_time),
            "n_features": len(selected_features)
        },
        "ga_xgb": {
            "rmse": float(xgb_rmse),
            "mae": float(xgb_mae),
            "r2": float(xgb_r2),
            "training_time": float(xgb_time),
            "n_features": len(selected_features)
        },
        "selected_features": selected_features,
        "ga_fitness_score": float(ga_fitness_score) if ga_fitness_score is not None else 0.0
    }
    
    out_json_path = os.path.join(results_dir, 'ga_models.json')
    with open(out_json_path, 'w') as f:
        json.dump(ga_models_results, f, indent=4)
        
    print(f"Results saved to {out_json_path}")
    
    # Load baseline_rf results for comparison
    baseline_rf_path = os.path.join(results_dir, 'baseline_rf.json')
    if os.path.exists(baseline_rf_path):
        with open(baseline_rf_path, 'r') as f:
            baseline_rf_data = json.load(f)
    else:
        baseline_rf_data = {"RMSE": 0, "MAE": 0, "R2": 0}
        
    # 5. Print Comparison Table
    print("\n" + "="*70)
    print(f"{'Model':<20} | {'RMSE':<10} | {'MAE':<10} | {'R2':<10} | {'Train Time (s)':<15}")
    print("-" * 70)
    print(f"{'Baseline RF':<20} | {baseline_rf_data['RMSE']:<10.4f} | {baseline_rf_data['MAE']:<10.4f} | {baseline_rf_data['R2']:<10.4f} | {baseline_rf_data.get('training_time', 0):<15.4f}")
    print(f"{'GA + RF':<20} | {rf_rmse:<10.4f} | {rf_mae:<10.4f} | {rf_r2:<10.4f} | {rf_time:<15.4f}")
    print(f"{'GA + XGBoost':<20} | {xgb_rmse:<10.4f} | {xgb_mae:<10.4f} | {xgb_r2:<10.4f} | {xgb_time:<15.4f}")
    print("="*70 + "\n")
    
    # 7. Plot Grouped Bar Chart
    labels = ['RMSE', 'MAE', 'R2']
    baseline_rf_scores = [baseline_rf_data['RMSE'], baseline_rf_data['MAE'], baseline_rf_data['R2']]
    ga_rf_scores = [rf_rmse, rf_mae, rf_r2]
    ga_xgb_scores = [xgb_rmse, xgb_mae, xgb_r2]
    
    x = np.arange(len(labels))
    width = 0.25
    
    fig, ax1 = plt.subplots(figsize=(10, 6))
    
    rects1 = ax1.bar(x - width, baseline_rf_scores, width, label='Baseline RF', color='blue')
    rects2 = ax1.bar(x, ga_rf_scores, width, label='GA + RF', color='orange')
    rects3 = ax1.bar(x + width, ga_xgb_scores, width, label='GA + XGB', color='green')
    
    ax1.set_ylabel('Scores (RMSE / MAE / R2)')
    ax1.set_title('Comparison: Baseline vs GA Models')
    ax1.set_xticks(x)
    ax1.set_xticklabels(labels)
    ax1.legend()
    
    # Use logarithmic scale for Y so R2 (near 1.0) is visible along with RMSE (~400)
    ax1.set_yscale('log')
    
    fig.tight_layout()
    plot_path = os.path.join(results_dir, 'ga_vs_baseline_comparison.png')
    plt.savefig(plot_path)
    print(f"Comparison plot saved to {plot_path}")

if __name__ == "__main__":
    main()
