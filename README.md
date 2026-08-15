# Gemstone Price Prediction using Nature-Inspired Feature Selection

An Nature-Inspired Algorithms (NIA) mini-project for predicting gemstone prices. This repository utilizes metaheuristic optimization techniques—namely **Genetic Algorithms (GA)** and **Particle Swarm Optimization (PSO)**—for feature selection, combined with machine learning models (**Random Forest** and **XGBoost**) for price prediction.

---

## 👥 Team Members
- **Sajini** (Index: `[Index Number]`) — Working on Random Forest & Genetic Algorithm
- **Buddhika** (Index: `[Index Number]`) — Working on XGBoost & Particle Swarm Optimization

**Module Lecturer:** `[Lecturer Name]`

---

## 📂 Project Repository Structure

```text
gemstone-NIA-project/
├── data/                     # Raw and preprocessed dataset files (git-ignored)
│   ├── raw/
│   └── processed/
├── models/                   # Saved trained model artifacts (.pkl, .joblib)
├── notebooks/                # Jupyter Notebooks for exploration and prototyping
│   ├── sajini/               # Sajini's experimental notebooks
│   └── buddhika/             # Buddhika's experimental notebooks
├── report/                   # Final project report drafts and references
├── results/                  # Generated evaluation metrics, plots, and saved models
├── src/                      # Reusable Python modules
│   ├── config.py             # Domain mappings (categories, splits)
│   ├── evaluate.py           # Evaluation metrics and plotting
│   ├── ga.py                 # Genetic Algorithm implementation/wrapper
│   ├── models.py             # Model training and prediction pipelines
│   ├── preprocessing.py      # Data cleaning and transformations
│   └── pso.py                # Particle Swarm Optimization implementation/wrapper
├── .gitignore                # Git exclusions
├── config.py                 # Central configuration for directory paths and parameters
├── README.md                 # Project documentation
└── requirements.txt          # Python dependencies
```

---

## 🌿 Branching Strategy & Tasks

This project is split into two main branches off `main` for parallel development:

### 1. `sajini-ga` (Sajini's Branch)
*   **Dataset:** Diamonds Dataset Preprocessing (`data/raw/diamonds.csv`)
*   **Baseline Model:** Random Forest
*   **Optimization:** Feature selection using **Genetic Algorithm (GA)**
*   **Goal:** Optimize features to improve Random Forest regression performance.

### 2. `buddhika-pso` (Buddhika's Branch)
*   **Dataset:** Gemstone Dataset Preprocessing (`data/raw/gemstone.csv`)
*   **Baseline Model:** XGBoost
*   **Optimization:** Feature selection using **Particle Swarm Optimization (PSO)**
*   **Goal:** Optimize features to improve XGBoost regression performance.

---

## 🚀 Setup Instructions

### 1. Clone the repository and navigate to the folder
```bash
git clone <repository_url>
cd gemstone-NIA-project
```

### 2. Check out your respective branch
*   **For Sajini:**
    ```bash
    git checkout sajini-ga
    ```
*   **For Buddhika:**
    ```bash
    git checkout buddhika-pso
    ```

### 3. Create a virtual environment and install dependencies
It is recommended to use a virtual environment:
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 4. Place Data Files
Place raw dataset files inside the `data/raw/` directory (e.g., `diamonds.csv` and `gemstone.csv`).
