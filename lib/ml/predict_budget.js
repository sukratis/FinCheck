// lib/ml/predict_budget.js

import * as tf from '@tensorflow/tfjs';
import * as joblib from 'joblib'; // (we'll adjust this because Next.js can't load .pkl directly)

// lib/ml/predict_budget.js

export async function predictBudget(userFeatures) {
    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userFeatures),
      });
  
      const result = await response.json();
      return result.predicted_budget;
    } catch (error) {
      console.error('Prediction error:', error);
      return null;
    }
  }
  
