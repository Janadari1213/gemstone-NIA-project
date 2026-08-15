import pandas as pd
import numpy as np
import time
import json
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from xgboost import XGBRegressor

import os
import sys

# Ensure src is in the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.config import RANDOM_STATE, TEST_SIZE

def main():
    # Load data
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'gemstone_clean.csv')
    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)
    
    # Separate features and target
    X = df.drop(columns=['price'])
    y = df['price']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    
    print(f"Training data shape: {X_train.shape}")
    print(f"Testing data shape: {X_test.shape}")
    
    # Train XGBoost
    print("Training Baseline XGBoost Regressor...")
    model = XGBRegressor(
        n_estimators=100, 
        learning_rate=0.1, 
        random_state=RANDOM_STATE
    )
    
    start_time = time.time()
    model.fit(X_train, y_train)
    end_time = time.time()
    training_time = end_time - start_time
    
    # Evaluate
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    # Print summary
    print("\n" + "="*30)
    print("Baseline XGBoost Results:")
    print("="*30)
    print(f"RMSE:          {rmse:.4f}")
    print(f"MAE:           {mae:.4f}")
    print(f"R²:            {r2:.4f}")
    print(f"Training Time: {training_time:.4f} seconds")
    print("="*30 + "\n")
    
    # Results directory
    results_dir = os.path.join(os.path.dirname(__file__), '..', 'results')
    os.makedirs(results_dir, exist_ok=True)
    
    # Save model
    model_path = os.path.join(results_dir, 'baseline_xgb.pkl')
    joblib.dump(model, model_path)
    
    # Save metrics
    metrics = {
        'RMSE': float(rmse),
        'MAE': float(mae),
        'R2': float(r2),
        'training_time': float(training_time),
        'n_features_used': len(X.columns),
        'feature_list': X.columns.tolist()
    }
    metrics_path = os.path.join(results_dir, 'baseline_xgb.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=4)
        
    # Plot feature importance
    print("Generating feature importance plot...")
    feature_importances = model.feature_importances_
    sorted_idx = np.argsort(feature_importances)
    features_sorted = np.array(X.columns)[sorted_idx]
    importances_sorted = feature_importances[sorted_idx]
    plot_path = os.path.join(results_dir, 'baseline_xgb_feature_importance.png')

    try:
        import matplotlib.pyplot as plt
        plt.figure(figsize=(10, 6))
        plt.barh(range(len(sorted_idx)), importances_sorted, align='center')
        plt.yticks(range(len(sorted_idx)), features_sorted)
        plt.title('Feature Importance (Baseline XGBoost)')
        plt.xlabel('Importance')
        plt.tight_layout()
        plt.savefig(plot_path)
    except ImportError:
        print("matplotlib not found, using PIL for plotting...")
        from PIL import Image, ImageDraw, ImageFont
        width, height = 800, 600
        img = Image.new('RGB', (width, height), color='white')
        d = ImageDraw.Draw(img)
        
        # Simple custom bar chart drawing
        margin_left = 200
        margin_right = 50
        margin_top = 50
        margin_bottom = 50
        plot_width = width - margin_left - margin_right
        plot_height = height - margin_top - margin_bottom
        
        n_features = len(features_sorted)
        bar_height = (plot_height / n_features) * 0.8
        max_imp = max(importances_sorted)
        
        for i, (feat, imp) in enumerate(zip(features_sorted, importances_sorted)):
            y = height - margin_bottom - (i + 1) * (plot_height / n_features)
            bar_width = (imp / max_imp) * plot_width
            d.rectangle([margin_left, y, margin_left + bar_width, y + bar_height], fill='blue')
            d.text((10, y + bar_height/4), str(feat), fill='black')
            d.text((margin_left + bar_width + 5, y + bar_height/4), f"{imp:.4f}", fill='black')
            
        d.text((width/2 - 100, 20), 'Feature Importance (Baseline XGBoost)', fill='black')
        img.save(plot_path)
    
    print(f"Model saved to:   {model_path}")
    print(f"Metrics saved to: {metrics_path}")
    print(f"Plot saved to:    {plot_path}")

if __name__ == "__main__":
    main()
