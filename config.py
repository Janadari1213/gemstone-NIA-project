import os

# Base directory of the project
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Data directories
DATA_DIR = os.path.join(BASE_DIR, 'data')
RAW_DATA_DIR = os.path.join(DATA_DIR, 'raw')
PROCESSED_DATA_DIR = os.path.join(DATA_DIR, 'processed')

# Models directory
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# Ensure directories exist
for directory in [RAW_DATA_DIR, PROCESSED_DATA_DIR, MODELS_DIR]:
    os.makedirs(directory, exist_ok=True)

# Random Seed for reproducibility
RANDOM_STATE = 42

# Preprocessing configs
DIAMONDS_DATASET_NAME = "diamonds.csv"
GEMSTONE_DATASET_NAME = "gemstone.csv"

# Model parameters
RF_PARAMS = {
    'n_estimators': 100,
    'max_depth': None,
    'random_state': RANDOM_STATE,
    'n_jobs': -1
}

XGB_PARAMS = {
    'n_estimators': 100,
    'max_depth': 6,
    'learning_rate': 0.1,
    'random_state': RANDOM_STATE,
    'n_jobs': -1
}

# Feature selection settings
GA_PARAMS = {
    'population_size': 50,
    'generations': 20,
    'crossover_prob': 0.8,
    'mutation_prob': 0.2
}

PSO_PARAMS = {
    'num_particles': 30,
    'iterations': 20,
    'c1': 1.5,
    'c2': 1.5,
    'w': 0.7
}
