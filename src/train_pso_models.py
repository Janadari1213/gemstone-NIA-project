import pandas as pd
import numpy as np
import time
import json
import os
import sys
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from xgboost import XGBRegressor
from sklearn.ensemble import RandomForestRegressor

# Ensure src is in the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.config import RANDOM_STATE, TEST_SIZE

def main():
    print("Training final models using PSO-selected features...")
    
    # Paths
    base_dir = os.path.dirname(__file__)
    data_path = os.path.join(base_dir, '..', 'data', 'gemstone_clean.csv')
    results_dir = os.path.join(base_dir, '..', 'results')
    pso_json_path = os.path.join(results_dir, 'pso_selected_features.json')
    baseline_json_path = os.path.join(results_dir, 'baseline_xgb.json')
    
    # 1. Load PSO selected features
    with open(pso_json_path, 'r') as f:
        pso_results = json.load(f)
        
    selected_features = pso_results['selected_features']
    pso_fitness_score = pso_results['fitness']
    print(f"Selected features ({len(selected_features)}): {selected_features}")
    
    # Load baseline metrics for comparison
    with open(baseline_json_path, 'r') as f:
        baseline_metrics = json.load(f)
        
    # 2. Load and split data
    df = pd.read_csv(data_path)
    X = df.drop(columns=['price'])
    y = df['price']
    
    # Identical split as before
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    
    # Filter features based on PSO
    X_train_pso = X_train[selected_features]
    X_test_pso = X_test[selected_features]
    
    results = {
        "selected_features": selected_features,
        "pso_fitness_score": float(pso_fitness_score)
    }
    
    # 3. Train XGBoost
    print("\nTraining PSO + XGBoost...")
    xgb_model = XGBRegressor(
        n_estimators=100,
        learning_rate=0.1,
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
    
    start_time = time.time()
    xgb_model.fit(X_train_pso, y_train)
    xgb_time = time.time() - start_time
    
    y_pred_xgb = xgb_model.predict(X_test_pso)
    xgb_rmse = np.sqrt(mean_squared_error(y_test, y_pred_xgb))
    xgb_mae = mean_absolute_error(y_test, y_pred_xgb)
    xgb_r2 = r2_score(y_test, y_pred_xgb)
    
    results["pso_xgb"] = {
        "rmse": float(xgb_rmse),
        "mae": float(xgb_mae),
        "r2": float(xgb_r2),
        "training_time": float(xgb_time),
        "n_features": len(selected_features)
    }
    
    # 4. Train Random Forest
    print("Training PSO + Random Forest...")
    rf_model = RandomForestRegressor(
        n_estimators=100, 
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
    
    start_time = time.time()
    rf_model.fit(X_train_pso, y_train)
    rf_time = time.time() - start_time
    
    y_pred_rf = rf_model.predict(X_test_pso)
    rf_rmse = np.sqrt(mean_squared_error(y_test, y_pred_rf))
    rf_mae = mean_absolute_error(y_test, y_pred_rf)
    rf_r2 = r2_score(y_test, y_pred_rf)
    
    results["pso_rf"] = {
        "rmse": float(rf_rmse),
        "mae": float(rf_mae),
        "r2": float(rf_r2),
        "training_time": float(rf_time),
        "n_features": len(selected_features)
    }
    
    # 5. Print Comparison Table
    print("\n" + "="*80)
    print(f"{'Model':<20} | {'RMSE':<10} | {'MAE':<10} | {'R2':<10} | {'Time (s)':<10} | {'Features':<10}")
    print("-" * 80)
    print(f"{'Baseline XGBoost':<20} | {baseline_metrics['RMSE']:<10.4f} | {baseline_metrics['MAE']:<10.4f} | {baseline_metrics['R2']:<10.4f} | {baseline_metrics['training_time']:<10.4f} | {baseline_metrics['n_features_used']:<10}")
    print(f"{'PSO + XGBoost':<20} | {xgb_rmse:<10.4f} | {xgb_mae:<10.4f} | {xgb_r2:<10.4f} | {xgb_time:<10.4f} | {len(selected_features):<10}")
    print(f"{'PSO + Random Forest':<20} | {rf_rmse:<10.4f} | {rf_mae:<10.4f} | {rf_r2:<10.4f} | {rf_time:<10.4f} | {len(selected_features):<10}")
    print("=" * 80 + "\n")
    
    # 6. Save JSON
    out_json = os.path.join(results_dir, 'pso_models.json')
    with open(out_json, 'w') as f:
        json.dump(results, f, indent=4)
        
    # 7. Plotting Grouped Bar Chart
    print("Generating comparison plot...")
    try:
        import matplotlib.pyplot as plt
        
        models = ['Baseline XGB', 'PSO + XGB', 'PSO + RF']
        rmse_vals = [baseline_metrics['RMSE'], xgb_rmse, rf_rmse]
        mae_vals = [baseline_metrics['MAE'], xgb_mae, rf_mae]
        r2_vals = [baseline_metrics['R2'], xgb_r2, rf_r2]
        
        x = np.arange(len(models))
        width = 0.25
        
        fig, ax1 = plt.subplots(figsize=(10, 6))
        
        rects1 = ax1.bar(x - width, rmse_vals, width, label='RMSE', color='tab:blue')
        rects2 = ax1.bar(x, mae_vals, width, label='MAE', color='tab:orange')
        
        # R2 is on a different scale (0 to 1), so put it on a secondary y-axis
        ax2 = ax1.twinx()
        rects3 = ax2.bar(x + width, r2_vals, width, label='R²', color='tab:green')
        
        ax1.set_ylabel('Error (RMSE, MAE)')
        ax2.set_ylabel('R² Score')
        ax1.set_title('Model Performance Comparison (Test Set)')
        ax1.set_xticks(x)
        ax1.set_xticklabels(models)
        
        # Combined legend
        lines, labels = ax1.get_legend_handles_labels()
        lines2, labels2 = ax2.get_legend_handles_labels()
        ax1.legend(lines + lines2, labels + labels2, loc='upper center', bbox_to_anchor=(0.5, -0.15), ncol=3)
        
        # Annotate bars
        def autolabel(rects, ax, fmt='%.1f'):
            for rect in rects:
                height = rect.get_height()
                ax.annotate(fmt % height,
                            xy=(rect.get_x() + rect.get_width() / 2, height),
                            xytext=(0, 3),  # 3 points vertical offset
                            textcoords="offset points",
                            ha='center', va='bottom', fontsize=8)
                            
        autolabel(rects1, ax1, '%.1f')
        autolabel(rects2, ax1, '%.1f')
        autolabel(rects3, ax2, '%.4f')
        
        plt.tight_layout()
        plot_path = os.path.join(results_dir, 'pso_vs_baseline_comparison.png')
        plt.savefig(plot_path)
        print(f"Plot saved to: {plot_path}")
    except ImportError:
        print("matplotlib not found, skipping plot.")

if __name__ == "__main__":
    main()
