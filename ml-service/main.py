"""
============================================
Smart Expense Tracker - ML Microservice
FastAPI server for AI/ML predictions
============================================
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import List, Optional
import uvicorn
import os
import subprocess

from predict import predict_next_month
from train_model import train_and_save_model, MODEL_DIR

# ---- App Setup ----

app = FastAPI(
    title="Smart Expense Tracker - ML Service",
    description="AI-powered spending predictions and financial insights",
    version="1.0.0",
)

# Allow requests from backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Request/Response Models (Pydantic) ----

class PredictionRequest(BaseModel):
    """Input: list of monthly spending totals, oldest first."""
    monthly_data: List[float]

    @validator("monthly_data")
    def validate_data(cls, v):
        if len(v) < 1:
            raise ValueError("monthly_data must contain at least 1 value")
        if any(x < 0 for x in v):
            raise ValueError("Spending values cannot be negative")
        if len(v) > 24:
            raise ValueError("Maximum 24 months of data supported")
        return v


class PredictionResponse(BaseModel):
    predicted_spending: float
    budget_suggestion: str
    confidence: float
    trend: str
    trend_percentage: Optional[float] = None
    source: str = "ml_model"


# ---- Startup: Auto-train if model doesn't exist ----

@app.on_event("startup")
async def startup_event():
    """Train model on startup if it doesn't already exist."""
    model_path = os.path.join(MODEL_DIR, "expense_predictor.pkl")
    if not os.path.exists(model_path):
        print("🤖 No saved model found. Training initial model...")
        try:
            train_and_save_model()
        except Exception as e:
            print(f"⚠️  Model training failed: {e}. Using fallback predictions.")
    else:
        print("✅ ML model loaded successfully")


# ---- API Endpoints ----

@app.get("/")
def root():
    """Health check."""
    return {
        "service": "Smart Expense Tracker ML Service",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    """Detailed health check."""
    model_path = os.path.join(MODEL_DIR, "expense_predictor.pkl")
    model_exists = os.path.exists(model_path)
    return {
        "status": "healthy",
        "model_loaded": model_exists,
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    """
    Predict next month's spending based on historical monthly totals.
    
    Send monthly totals as a list, oldest first:
    Example: [800.0, 950.0, 1100.0, 890.0, 1050.0]
    """
    try:
        result = predict_next_month(request.monthly_data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/retrain")
def retrain_model():
    """Retrain the model (admin endpoint)."""
    try:
        train_and_save_model()
        return {"success": True, "message": "Model retrained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---- Run Server ----

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes (development)
        log_level="info",
    )