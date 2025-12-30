from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI()

# Load Model
if os.path.exists("heart_model.pkl") and os.path.exists("heart_scaler.pkl"):
    model = joblib.load("heart_model.pkl")
    scaler = joblib.load("heart_scaler.pkl")
    print("✅ AI Engine Ready.")
else:
    print("⚠️ Model not found. Run training script first.")

# Skema Data (Validasi Input) - Module 10 Interoperability
class PatientInput(BaseModel):
    age: float
    sex: str
    cp: float
    trestbps: float
    chol: float
    fbs: float
    restecg: float
    thalach: float
    exang: float
    oldpeak: float
    slope: float
    ca: float
    thal: float

@app.post("/predict")
def predict_heart_disease(data: PatientInput):
    if not model or not scaler:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        # Preprocessing Logic
        sex_val = 1 if data.sex.lower() in ["male", "1"] else 0
        
        input_array = np.array([[
            data.age, sex_val, data.cp, data.trestbps, data.chol, 
            data.fbs, data.restecg, data.thalach, data.exang, 
            data.oldpeak, data.slope, data.ca, data.thal
        ]])
        
        scaled_data = scaler.transform(input_array)
        prediction = model.predict(scaled_data)[0]
        probability = model.predict_proba(scaled_data)[0][1]

        return {
            "status": "success",
            "prediction_class": int(prediction), # 0 or 1
            "result_text": "Risiko Tinggi" if prediction == 1 else "Risiko Rendah",
            "probability_percent": round(probability * 100, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Run dengan: uvicorn main:app --port 8000 --reload