# fastapi_server/main.py

from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib

# Initialize app
app = FastAPI()

# Load your trained model
model = joblib.load('ml/budget_predictor_model.pkl')  # Adjust path if needed

# Define the expected input data format
class UserData(BaseModel):
    Income: float
    Age: int
    Dependents: int
    Occupation: int
    City_Tier: int
    Rent: float
    Loan_Repayment: float
    Insurance: float
    Groceries: float
    Transport: float
    Eating_Out: float
    Entertainment: float
    Utilities: float
    Healthcare: float
    Education: float
    Miscellaneous: float
    Desired_Savings_Percentage: float

@app.post("/predict")
def predict(user_data: UserData):
    # Convert user data into a dataframe
    input_data = pd.DataFrame([user_data.dict()])

    # Predict the spending using the model
    prediction = model.predict(input_data)[0]

    return {"predicted_budget": prediction}
