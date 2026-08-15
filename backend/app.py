from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# Load the baseline XGBoost model for Price
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../results/baseline_xgb.pkl')
try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
except Exception as e:
    print(f"Error loading price model: {e}")
    model = None

# Load the XGBoost Classifier for Gem Name
CLASSIFIER_PATH = os.path.join(os.path.dirname(__file__), '../results/gem_classifier.pkl')
try:
    with open(CLASSIFIER_PATH, 'rb') as f:
        classifier = pickle.load(f)
except Exception as e:
    print(f"Error loading classifier model: {e}")
    classifier = None

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not classifier:
        return jsonify({'error': 'Models not loaded'}), 500
        
    try:
        data = request.json
        
        # Extract features (defaulting missing to averages)
        carat = float(data.get('carat', 0.5))
        cut = float(data.get('cut', 3))
        color = float(data.get('color', 4))
        clarity = float(data.get('clarity', 4))
        x = float(data.get('x', 5.0))
        y = float(data.get('y', 5.0))
        z = float(data.get('z', 3.0))
        
        # Impute depth and table using rough averages or from data
        depth = float(data.get('depth', 61.7))
        table = float(data.get('table', 57.5))
        
        # Feature order must match training: carat, cut, color, clarity, depth, table, x, y, z
        features = pd.DataFrame([{
            'carat': carat,
            'cut': cut,
            'color': color,
            'clarity': clarity,
            'depth': depth,
            'table': table,
            'x': x,
            'y': y,
            'z': z
        }])
        
        # Predict Price
        predicted_price = model.predict(features)[0]
        predicted_price = max(0, float(predicted_price))
        
        # Predict Gem Name (1 = Diamond, 0 = Cubic Zirconia)
        predicted_class = classifier.predict(features)[0]
        gem_name = "Diamond" if predicted_class == 1 else "Cubic Zirconia"
        
        return jsonify({
            'success': True,
            'price': predicted_price,
            'gem_name': gem_name
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)
