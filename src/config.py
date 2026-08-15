# Shared configuration for Gemstone Price Prediction project

# Note on data files:
# Raw input file for the gemstone dataset is named: cubic_zirconia.csv
# Cleaned output file is consistently named: gemstone_clean.csv
# This maintains consistency across the project while preserving the raw filename.

# Random state for reproducibility
RANDOM_STATE = 42

# Train/Test split ratio
TEST_SIZE = 0.2

# Ordinal ordering for categorical features
# These should match the order of increasing quality/value

CUT_ORDER = ['Fair', 'Good', 'Very Good', 'Premium', 'Ideal']

COLOR_ORDER = ['J', 'I', 'H', 'G', 'F', 'E', 'D']  # J is worst, D is best

CLARITY_ORDER = ['I1', 'SI2', 'SI1', 'VS2', 'VS1', 'VVS2', 'VVS1', 'IF'] # I1 is worst, IF is best
