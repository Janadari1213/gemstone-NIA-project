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
   Place your dataset inside the `/data` folder.
   *Note: For the gemstone dataset, the raw input file is `cubic_zirconia.csv`, and the cleaned output file is named `gemstone_clean.csv`. This maintains consistency across the project while preserving the raw filename.*
5. **Run tests/exploration:**
   Check out the `/notebooks` folder to start exploring!