import pandas as pd
import numpy as np
import time
import json
import os
import sys
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor

try:
    from src.config import RANDOM_STATE, TEST_SIZE
except ModuleNotFoundError:
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from src.config import RANDOM_STATE, TEST_SIZE

# --- GA Parameters ---
POPULATION_SIZE = 40
GENERATIONS = 40
TOURNAMENT_SIZE = 3
CROSSOVER_PROB = 0.8
MUTATION_PROB = 0.02
ELITISM_COUNT = 2

def evaluate_fitness(chromosome, X_train, y_train):
    """
    Evaluates the fitness of a single chromosome.
    Fitness = (5-fold CV R^2 on training data) - (0.001 * num_selected_features)
    """
    # Find which features are selected (where chromosome == 1)
    selected_indices = np.where(chromosome == 1)[0]
    num_selected = len(selected_indices)
    
    # If no features are selected, return a very poor fitness score
    if num_selected == 0:
        return -999.0
        
    X_subset = X_train.iloc[:, selected_indices]
    
    # Train random forest with same defaults as baseline
    rf = RandomForestRegressor(n_estimators=100, random_state=RANDOM_STATE, n_jobs=-1)
    
    # 5-fold cross-validation on training data only
    scores = cross_val_score(rf, X_subset, y_train, cv=5, scoring='r2', n_jobs=-1)
    mean_r2 = scores.mean()
    
    # Apply penalty for selecting too many features
    fitness = mean_r2 - (0.001 * num_selected)
    return fitness

def initialize_population(pop_size, num_features):
    """
    Initializes a population of binary vectors randomly.
    Ensures no chromosome is entirely zeros.
    """
    # np.random.seed is set for reproducibility in main
    population = np.random.randint(2, size=(pop_size, num_features))
    
    # Repair all-zero chromosomes
    for i in range(pop_size):
        if np.sum(population[i]) == 0:
            random_idx = np.random.randint(num_features)
            population[i, random_idx] = 1
            
    return population

def tournament_selection(population, fitness_scores, tournament_size):
    """
    Selects one parent using tournament selection.
    Picks 'tournament_size' individuals at random and returns the one with the best fitness.
    """
    pop_size = len(population)
    # Select random indices for the tournament
    tournament_indices = np.random.choice(pop_size, size=tournament_size, replace=False)
    
    # Find the best fitness among the selected individuals
    best_idx = tournament_indices[np.argmax([fitness_scores[i] for i in tournament_indices])]
    return population[best_idx]

def single_point_crossover(parent1, parent2, crossover_prob):
    """
    Performs single-point crossover between two parents.
    """
    if np.random.rand() < crossover_prob:
        # Choose a random crossover point (1 to len-1)
        crossover_point = np.random.randint(1, len(parent1))
        child1 = np.concatenate([parent1[:crossover_point], parent2[crossover_point:]])
        child2 = np.concatenate([parent2[:crossover_point], parent1[crossover_point:]])
        return child1, child2
    else:
        # No crossover, children are exact copies of parents
        return parent1.copy(), parent2.copy()

def bit_flip_mutation(chromosome, mutation_prob):
    """
    Flips each bit in the chromosome with probability mutation_prob.
    """
    for i in range(len(chromosome)):
        if np.random.rand() < mutation_prob:
            chromosome[i] = 1 - chromosome[i]  # Flip 0 to 1, or 1 to 0
            
    # Repair if all zeros
    if np.sum(chromosome) == 0:
        chromosome[np.random.randint(len(chromosome))] = 1
        
    return chromosome

def run_ga_feature_selection():
    print("--- Genetic Algorithm Feature Selection (Diamonds Dataset) ---")
    np.random.seed(RANDOM_STATE)
    
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(project_root, 'data', 'diamonds_clean.csv')
    
    # 1. Load Data
    df = pd.read_csv(data_path)
    X = df.drop('price', axis=1)
    y = df['price']
    
    # 2. Split train/test (GA uses ONLY training data)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    
    num_features = X_train.shape[1]
    feature_names = X.columns.tolist()
    
    print(f"Total features available: {num_features}")
    print(f"Initializing GA: Pop Size={POPULATION_SIZE}, Gen={GENERATIONS}")
    
    # 3. Initialize Population
    population = initialize_population(POPULATION_SIZE, num_features)
    
    best_fitness_history = []
    avg_fitness_history = []
    
    global_best_chromosome = None
    global_best_fitness = -np.inf
    
    start_time = time.time()
    
    # 4. Evolution Loop
    for gen in range(GENERATIONS):
        # Evaluate fitness for all individuals
        fitness_scores = [evaluate_fitness(ind, X_train, y_train) for ind in population]
        
        # Track statistics
        gen_best_idx = np.argmax(fitness_scores)
        gen_best_fitness = fitness_scores[gen_best_idx]
        gen_avg_fitness = np.mean(fitness_scores)
        
        best_fitness_history.append(gen_best_fitness)
        avg_fitness_history.append(gen_avg_fitness)
        
        # Update global best
        if gen_best_fitness > global_best_fitness:
            global_best_fitness = gen_best_fitness
            global_best_chromosome = population[gen_best_idx].copy()
            
        print(f"Generation {gen+1}/{GENERATIONS} | Best Fitness: {gen_best_fitness:.4f} | Avg Fitness: {gen_avg_fitness:.4f}")
        
        # Next generation
        new_population = []
        
        # Elitism: keep best individuals
        sorted_indices = np.argsort(fitness_scores)[::-1]
        for i in range(ELITISM_COUNT):
            new_population.append(population[sorted_indices[i]].copy())
            
        # Fill the rest of the population
        while len(new_population) < POPULATION_SIZE:
            # Selection
            parent1 = tournament_selection(population, fitness_scores, TOURNAMENT_SIZE)
            parent2 = tournament_selection(population, fitness_scores, TOURNAMENT_SIZE)
            
            # Crossover
            child1, child2 = single_point_crossover(parent1, parent2, CROSSOVER_PROB)
            
            # Mutation
            child1 = bit_flip_mutation(child1, MUTATION_PROB)
            child2 = bit_flip_mutation(child2, MUTATION_PROB)
            
            new_population.append(child1)
            if len(new_population) < POPULATION_SIZE:
                new_population.append(child2)
                
        population = new_population

    end_time = time.time()
    total_time = end_time - start_time
    
    # 5. Final Results
    best_feature_indices = np.where(global_best_chromosome == 1)[0]
    best_feature_names = [feature_names[i] for i in best_feature_indices]
    
    print("\n--- GA Optimization Complete ---")
    print(f"Total Runtime: {total_time:.2f} seconds")
    print(f"Best Fitness Score: {global_best_fitness:.4f}")
    print(f"Selected Features ({len(best_feature_names)}/{num_features}): {best_feature_names}")
    
    # Recalculate pure CV R2 for the best chromosome without penalty
    best_r2 = global_best_fitness + (0.001 * len(best_feature_names))
    
    # 6. Save Outputs
    results_dir = os.path.join(project_root, 'results')
    os.makedirs(results_dir, exist_ok=True)
    
    # Plot Convergence
    plt.figure(figsize=(10, 6))
    plt.plot(range(1, GENERATIONS + 1), best_fitness_history, label='Best Fitness', marker='o')
    plt.plot(range(1, GENERATIONS + 1), avg_fitness_history, label='Avg Fitness', marker='s')
    plt.title('GA Convergence (Diamonds Dataset)')
    plt.xlabel('Generation')
    plt.ylabel('Fitness Score')
    plt.legend()
    plt.grid(True)
    
    plot_path = os.path.join(results_dir, 'ga_convergence.png')
    plt.savefig(plot_path)
    plt.close()
    
    # Save JSON
    results = {
        'best_fitness': global_best_fitness,
        'cv_r2': best_r2,
        'num_features_selected': len(best_feature_names),
        'selected_features': best_feature_names,
        'total_runtime_seconds': total_time,
        'ga_parameters': {
            'population_size': POPULATION_SIZE,
            'generations': GENERATIONS,
            'tournament_size': TOURNAMENT_SIZE,
            'crossover_prob': CROSSOVER_PROB,
            'mutation_prob': MUTATION_PROB,
            'elitism_count': ELITISM_COUNT
        }
    }
    
    json_path = os.path.join(results_dir, 'ga_selected_features.json')
    with open(json_path, 'w') as f:
        json.dump(results, f, indent=4)
        
    print(f"\nSaved convergence plot to {plot_path}")
    print(f"Saved results to {json_path}")

if __name__ == "__main__":
    run_ga_feature_selection()
