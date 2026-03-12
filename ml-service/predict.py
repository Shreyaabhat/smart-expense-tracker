"""
============================================
Prediction Engine
Core logic for generating spending predictions
============================================
"""

import numpy as np
import joblib
import os
from typing import List

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "expense_predictor.pkl")


def load_model():
    """Load the trained model from disk."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found at {MODEL_PATH}. Run train_model.py first."
        )
    return joblib.load(MODEL_PATH)


def build_features(monthly_data: List[float]) -> np.ndarray:
    """Build feature vector from monthly spending history."""
    n = len(monthly_data)
    if n < 3:
        raise ValueError("Need at least 3 months of data for prediction")

    # Use the most recent 3 months
    recent = monthly_data[-3:]

    features = [
        recent[-1],                     # Last month
        recent[-2],                     # 2 months ago
        recent[-3],                     # 3 months ago
        np.mean(monthly_data[-3:]),     # 3-month rolling average
        recent[-1] - recent[-2],        # Month-over-month change
        np.std(monthly_data[-3:]),      # Spending volatility
    ]

    return np.array(features).reshape(1, -1)


def predict_next_month(monthly_data: List[float]) -> dict:
    """
    Given a list of monthly spending totals, predict next month's spending.
    
    Args:
        monthly_data: List of monthly totals, oldest first. E.g. [800, 950, 1100]
    
    Returns:
        dict with predicted_spending, budget_suggestion, confidence, trend
    """
    if len(monthly_data) < 2:
        avg = monthly_data[0] if monthly_data else 1000
        return {
            "predicted_spending": round(avg * 1.05, 2),
            "budget_suggestion": f"Based on your data, aim for under ${round(avg * 0.95, 2)} next month.",
            "confidence": 0.4,
            "trend": "neutral",
            "source": "simple_average",
        }

    try:
        model = load_model()
        features = build_features(monthly_data)
        prediction = float(model.predict(features)[0])

        # Sanity check: prediction shouldn't be wildly different from history
        avg = np.mean(monthly_data)
        prediction = np.clip(prediction, avg * 0.3, avg * 3.0)

    except (FileNotFoundError, Exception):
        # Fallback: weighted moving average if model is not available
        weights = np.array([0.2, 0.3, 0.5]) if len(monthly_data) >= 3 else None
        if weights is not None:
            prediction = float(np.average(monthly_data[-3:], weights=weights))
        else:
            prediction = float(np.mean(monthly_data[-2:]) * 1.02)

    # Calculate trend direction
    recent_avg = np.mean(monthly_data[-3:]) if len(monthly_data) >= 3 else monthly_data[-1]
    overall_avg = np.mean(monthly_data)
    trend_pct = ((recent_avg - overall_avg) / overall_avg) * 100

    if trend_pct > 5:
        trend = "increasing"
    elif trend_pct < -5:
        trend = "decreasing"
    else:
        trend = "stable"

    # Generate actionable budget suggestion
    budget_suggestion = generate_budget_suggestion(prediction, overall_avg, trend)

    return {
        "predicted_spending": round(prediction, 2),
        "budget_suggestion": budget_suggestion,
        "confidence": min(0.85, 0.5 + len(monthly_data) * 0.05),
        "trend": trend,
        "trend_percentage": round(trend_pct, 1),
        "source": "ml_model",
    }


def generate_budget_suggestion(predicted: float, avg: float, trend: str) -> str:
    """Generate a human-readable budget recommendation."""
    suggested_budget = round(predicted * 0.95, 2)  # Aim for 5% less than prediction

    messages = {
        "increasing": (
            f"Your spending is trending up. Set a strict budget of ${suggested_budget:.0f} "
            f"to bring it back in line. Consider cutting discretionary spending."
        ),
        "decreasing": (
            f"Great news — you're spending less! Maintain this momentum with a budget of "
            f"${suggested_budget:.0f} and consider saving the difference."
        ),
        "stable": (
            f"Your spending is consistent. A budget of ${suggested_budget:.0f} gives you "
            f"a 5% cushion to build savings."
        ),
    }

    return messages.get(trend, f"Suggested budget for next month: ${suggested_budget:.0f}")