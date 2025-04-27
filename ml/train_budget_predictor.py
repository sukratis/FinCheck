# ml/train_budget_predictor.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import joblib
import os

# Load the dataset
df = pd.read_csv('ml/data.csv')

# Print columns to debug
print("Dataset Columns:", df.columns)

# Define features and target
features = [
    'Groceries', 'Transport', 'Eating_Out', 'Entertainment',
    'Utilities', 'Healthcare', 'Education', 'Miscellaneous'
]
target = 'Disposable_Income'

# Check if columns exist
for col in features + [target]:
    if col not in df.columns:
        raise ValueError(f"Missing column in dataset: {col}")

# Prepare data
X = df[features]
y = df[target]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Model
model = LinearRegression()
model.fit(X_train, y_train)

# Save model
os.makedirs('ml', exist_ok=True)
joblib.dump(model, 'ml/budget_predictor_model.pkl')

print("✅ Model trained and saved to 'ml/budget_predictor_model.pkl'")
