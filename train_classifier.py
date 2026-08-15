import pandas as pd
import numpy as np
from xgboost import XGBClassifier
import pickle
import os

print("Loading datasets...")
diamonds = pd.read_csv('data/diamonds_clean.csv')
cubic = pd.read_csv('data/gemstone_clean.csv')

# Label them
diamonds['target'] = 1 # Diamond
cubic['target'] = 0    # Cubic Zirconia

# The features must match what the model expects: 'carat', 'cut', 'color', 'clarity', 'depth', 'table', 'x', 'y', 'z'
features = ['carat', 'cut', 'color', 'clarity', 'depth', 'table', 'x', 'y', 'z']

# Combine
combined = pd.concat([diamonds, cubic], ignore_index=True)

X = combined[features]
y = combined['target']

print("Training XGBoost Classifier...")
model = XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    random_state=42,
    use_label_encoder=False,
    eval_metric='logloss'
)

model.fit(X, y)

os.makedirs('results', exist_ok=True)
model_path = 'results/gem_classifier.pkl'
with open(model_path, 'wb') as f:
    pickle.dump(model, f)
    
print(f"Classifier saved successfully to {model_path}!")
