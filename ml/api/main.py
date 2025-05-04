# ml/api/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib
import uvicorn
from pydantic import BaseModel
import os

app = FastAPI()

# Allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../budget_predictor_model.pkl")
model = joblib.load('ml/budget_predictor_model.pkl')


class BudgetInput(BaseModel):
    user_features: dict  # Pass all features like income, rent, groceries, etc.

@app.post("/predict-budget")
def predict_budget(data: BudgetInput):
    try:
        df = pd.DataFrame([data.user_features])
        prediction = model.predict(df)[0]
        return {"predicted_budget": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run with: uvicorn ml.api.main:app --reload
