<<<<<<< HEAD
# Gemstone Price Prediction using GA & PSO

An Nature-Inspired Algorithms (NIA) mini-project for predicting gemstone prices. This repository utilizes metaheuristic optimization techniques—namely **Genetic Algorithms (GA)** and **Particle Swarm Optimization (PSO)**—for feature selection, combined with machine learning models (**Random Forest** and **XGBoost**) for price prediction.

---

## 📂 Project Repository Structure

```text
gemstone-NIA-project/
├── data/
│   ├── raw/                  # Raw dataset files
│   └── processed/            # Preprocessed datasets
├── models/                   # Saved model artifacts (.pkl, .joblib)
├── notebooks/                # Jupyter Notebooks for exploration and prototyping
├── src/
│   ├── preprocessing/        # Dataset cleaning and scaling scripts
│   ├── models/               # Model training and evaluation scripts
│   └── feature_selection/    # GA and PSO feature selection implementations
├── .gitignore                # Git exclusions
├── config.py                 # Central configurations (paths, seed, hyperparams)
├── README.md                 # Project overview and guidelines
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

## 🚀 How to Setup and Run

### 1. Clone the repository and navigate to the folder
```bash
git clone https://github.com/Sajini2/gemstone-NIA-project.git
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

### 3. Install dependencies
It is recommended to use a virtual environment (`venv`):
```bash
python -m venv venv
venv\Scripts\activate       # On Windows
source venv/bin/activate    # On Unix/macOS
pip install -r requirements.txt
```

---

## 🛠️ Algorithms and Technology Stack
*   **Language:** Python 3.8+
*   **Machine Learning:** Scikit-Learn, XGBoost
*   **Optimization:** DEAP (for GA), custom PSO/PyPSO
*   **Data Analysis:** Pandas, NumPy, Matplotlib, Seaborn
=======
# Gemstone Price Prediction using Nature-Inspired Feature Selection

## Project Description
This project aims to predict the price of gemstones using feature selection techniques based on Nature-Inspired Algorithms. We will explore Genetic Algorithms (GA) and Particle Swarm Optimization (PSO) for feature selection and compare their performance against baseline models like Random Forest and XGBoost without feature selection.

## Team Members
- Sajini (Index: [Index Number])
- Buddhika (Index: [Index Number])

**Module Lecturer:** [Lecturer Name]

## Folder Structure
- `/data`: Raw and cleaned CSV files (not tracked by git).
- `/notebooks`: Jupyter notebooks for data exploration and testing.
  - `/sajini`: Notebooks for Sajini.
  - `/buddhika`: Notebooks for Buddhika.
- `/src`: Reusable Python modules.
  - `config.py`: Shared constants (random seeds, category mappings, split ratios).
  - `preprocessing.py`: Data cleaning and preprocessing functions.
  - `ga.py`: Genetic Algorithm implementation/wrapper.
  - `pso.py`: Particle Swarm Optimization implementation/wrapper.
  - `models.py`: Model definition and training scripts.
  - `evaluate.py`: Model evaluation metrics and plotting.
- `/results`: Generated metrics, plots, and saved models.
- `/report`: Final project report drafts and references.

## Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd gemstone-NIA-project
   ```

2. **Create a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Add data:**
   Place your dataset (e.g., `gemstone.csv`) inside the `/data` folder.

5. **Run tests/exploration:**
   Check out the `/notebooks` folder to start exploring!
>>>>>>> 26457d0633f1f152547dece52a8c2c4c71d46fe2
