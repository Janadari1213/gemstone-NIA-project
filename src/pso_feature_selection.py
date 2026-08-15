import pandas as pd
import numpy as np
import time
import json
import os
import sys
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from xgboost import XGBRegressor

# Ensure src is in the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.config import RANDOM_STATE, TEST_SIZE

def sigmoid(x):
    """Sigmoid transform to convert velocity to a probability."""
    return 1 / (1 + np.exp(-x))

# Cache to memoize fitness evaluations to save time
fitness_cache = {}

def fitness_function(position, X_train, y_train):
    """
    Evaluates the fitness of a particle's position.
    position: binary array indicating selected features.
    Fitness = CV R^2 - 0.001 * n_selected_features
    """
    # Convert position to a string key for caching
    pos_key = ''.join(map(str, position.astype(int)))
    if pos_key in fitness_cache:
        return fitness_cache[pos_key]

    selected_indices = np.where(position == 1)[0]
    
    # If no features selected, return a very poor fitness
    if len(selected_indices) == 0:
        return -999.0, 0.0
        
    X_subset = X_train.iloc[:, selected_indices]
    
    # Same hyperparameters as the baseline for a fair comparison
    model = XGBRegressor(
        n_estimators=100,
        learning_rate=0.1,
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
    
    # 5-fold CV on the training set
    kf = KFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    scores = cross_val_score(model, X_subset, y_train, cv=kf, scoring='r2', n_jobs=-1)
    
    mean_r2 = scores.mean()
    
    # Penalty to encourage compact efficient feature subsets
    penalty = 0.001 * len(selected_indices)
    
    fitness = mean_r2 - penalty
    fitness_cache[pos_key] = (fitness, mean_r2)
    return fitness, mean_r2

def main():
    print("Starting Binary Particle Swarm Optimization (PSO) for Feature Selection...")
    start_time = time.time()
    
    # 1. Load Data
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'gemstone_clean.csv')
    df = pd.read_csv(data_path)
    X = df.drop(columns=['price'])
    y = df['price']
    
    # Split into train/test using 80/20. We will only use X_train during PSO search.
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    
    n_features = X_train.shape[1]
    feature_names = X_train.columns.tolist()
    
    # 2. PSO Parameters
    num_particles = 30
    max_iter = 40
    c1 = 1.5 # Cognitive coefficient
    c2 = 1.5 # Social coefficient
    w_max = 0.9 # Initial inertia weight
    w_min = 0.4 # Final inertia weight
    v_min, v_max = -4.0, 4.0 # Velocity clamping to avoid explosion
    
    # 3. Initialize Swarm
    np.random.seed(RANDOM_STATE)
    
    # Positions: randomly 0 or 1 for each feature
    positions = np.random.randint(2, size=(num_particles, n_features))
    
    # Ensure no all-zero particles initially
    for i in range(num_particles):
        if np.sum(positions[i]) == 0:
            positions[i, np.random.randint(n_features)] = 1
            
    # Velocities: initialized randomly between v_min and v_max
    velocities = np.random.uniform(v_min, v_max, (num_particles, n_features))
    
    # Personal bests
    pbest_positions = np.copy(positions)
    pbest_fitness = np.full(num_particles, -np.inf)
    pbest_r2 = np.zeros(num_particles)
    
    # Global best
    gbest_position = np.zeros(n_features)
    gbest_fitness = -np.inf
    gbest_r2 = 0.0
    
    # Tracking for convergence plot
    history_gbest = []
    history_avg = []
    
    print(f"PSO Parameters: Swarm Size={num_particles}, Iterations={max_iter}")
    
    # 4. PSO Main Loop
    for it in range(max_iter):
        iter_fitnesses = []
        
        # Linearly decay inertia weight
        w = w_max - it * ((w_max - w_min) / max_iter)
        
        for i in range(num_particles):
            # Evaluate fitness
            fit, r2 = fitness_function(positions[i], X_train, y_train)
            iter_fitnesses.append(fit)
            
            # Update personal best
            if fit > pbest_fitness[i]:
                pbest_fitness[i] = fit
                pbest_positions[i] = np.copy(positions[i])
                pbest_r2[i] = r2
                
                # Update global best
                if fit > gbest_fitness:
                    gbest_fitness = fit
                    gbest_position = np.copy(positions[i])
                    gbest_r2 = r2
        
        # Record history
        avg_fit = np.mean(iter_fitnesses)
        history_gbest.append(gbest_fitness)
        history_avg.append(avg_fit)
        
        print(f"Iteration {it+1:02d}/{max_iter} | Best Fitness: {gbest_fitness:.4f} | Avg Fitness: {avg_fit:.4f}")
        
        # Update velocities and positions
        for i in range(num_particles):
            r1 = np.random.rand(n_features)
            r2 = np.random.rand(n_features)
            
            # Velocity update equation
            velocities[i] = (w * velocities[i] + 
                             c1 * r1 * (pbest_positions[i] - positions[i]) + 
                             c2 * r2 * (gbest_position - positions[i]))
            
            # Velocity clamping to prevent extreme values before sigmoid transform
            velocities[i] = np.clip(velocities[i], v_min, v_max)
            
            # Position update (Binary PSO)
            # 1. Transform velocity to a probability using Sigmoid
            prob = sigmoid(velocities[i])
            # 2. Convert to binary mask: if prob > random(0,1), feature is selected
            r3 = np.random.rand(n_features)
            positions[i] = (prob > r3).astype(int)
            
            # Repair all-zero particles to ensure at least one feature is selected
            if np.sum(positions[i]) == 0:
                positions[i, np.random.randint(n_features)] = 1
                
    end_time = time.time()
    total_time = end_time - start_time
    
    # 5. Output Results
    selected_features = [feature_names[i] for i in range(n_features) if gbest_position[i] == 1]
    
    print("\n" + "="*50)
    print("PSO Feature Selection Completed!")
    print("="*50)
    print(f"Best Fitness:          {gbest_fitness:.4f}")
    print(f"Best CV R²:            {gbest_r2:.4f}")
    print(f"Num Features Selected: {len(selected_features)} / {n_features}")
    print(f"Selected Features:     {selected_features}")
    print(f"Total Runtime:         {total_time:.2f} seconds")
    print("="*50 + "\n")
    
    # Save artifacts
    results_dir = os.path.join(os.path.dirname(__file__), '..', 'results')
    os.makedirs(results_dir, exist_ok=True)
    
    results = {
        'fitness': float(gbest_fitness),
        'cv_r2': float(gbest_r2),
        'n_features_selected': len(selected_features),
        'selected_features': selected_features,
        'pso_parameters': {
            'num_particles': num_particles,
            'max_iter': max_iter,
            'c1': c1,
            'c2': c2,
            'w_max': w_max,
            'w_min': w_min,
            'v_min': v_min,
            'v_max': v_max
        },
        'total_runtime_seconds': float(total_time)
    }
    
    json_path = os.path.join(results_dir, 'pso_selected_features.json')
    with open(json_path, 'w') as f:
        json.dump(results, f, indent=4)
        
    # Plot convergence
    print("Generating convergence plot...")
    try:
        import matplotlib.pyplot as plt
        plt.figure(figsize=(10, 6))
        plt.plot(range(1, max_iter + 1), history_gbest, label='Global Best Fitness', color='blue', linewidth=2)
        plt.plot(range(1, max_iter + 1), history_avg, label='Average Swarm Fitness', color='orange', linestyle='--')
        plt.title('PSO Convergence Curve (Feature Selection)')
        plt.xlabel('Iteration')
        plt.ylabel('Fitness')
        plt.legend()
        plt.grid(True, linestyle='--', alpha=0.7)
        plt.tight_layout()
        plot_path = os.path.join(results_dir, 'pso_convergence.png')
        plt.savefig(plot_path)
        print(f"Plot saved to:    {plot_path}")
    except ImportError:
        print("matplotlib not found, skipping convergence plot.")
        
    print(f"Metrics saved to: {json_path}")

if __name__ == "__main__":
    main()
