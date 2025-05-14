# ml/api/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Fix the model path (relative to THIS file's location)
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../budget_predictor_model.pkl"))

try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Failed to load model from {MODEL_PATH}: {e}")


# Pydantic schema
class BudgetInput(BaseModel):
    user_features: dict


@app.post("/predict-budget")
def predict_budget(data: BudgetInput):
    try:
        df = pd.DataFrame([data.user_features])
        prediction = model.predict(df)[0]
        return {"predicted_budget": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")
