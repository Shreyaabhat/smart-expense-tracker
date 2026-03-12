#!/usr/bin/env python3
"""
============================================
Model Training Script
Run this once to train and save the model
Usage: python train_model.py
============================================
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score
import joblib
import os

# Output directory for saved models
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
os.makedirs(MODEL_DIR, exist_ok=True)


def generate_synthetic_training_data():
    """
    Generate synthetic monthly expense data for initial model training.
    In production, this would be replaced with real user data.
    """
    np.random.seed(42)
    n_samples = 500

    # Simulate realistic monthly expense patterns
    base_expenses = np.random.normal(1500, 400, n_samples)

    # Add seasonal variation (higher in Dec/Jan, lower in summer)
    months = np.arange(n_samples) % 12
    seasonal = 200 * np.sin(months * np.pi / 6) + 100

    # Add upward trend (inflation)
    trend = np.arange(n_samples) * 2

    expenses = base_expenses + seasonal + trend
    expenses = np.clip(expenses, 200, 5000)  # Realistic bounds

    return expenses


def create_features(data: list) -> np.ndarray:
    """
    Create features from historical monthly spending data.
    Features used: last 3 months, rolling average, trend direction
    """
    if len(data) < 3:
        raise ValueError("Need at least 3 months of data")

    # Use last 3 months as features
    n = len(data)
    X = []
    y = []

    for i in range(3, n):
        features = [
            data[i - 1],                            # Last month
            data[i - 2],                            # 2 months ago
            data[i - 3],                            # 3 months ago
            np.mean(data[max(0, i-3):i]),           # 3-month rolling avg
            data[i - 1] - data[i - 2],              # Month-over-month change
            np.std(data[max(0, i-3):i]),            # Volatility
        ]
        X.append(features)
        y.append(data[i])

    return np.array(X), np.array(y)


def train_and_save_model():
    """Train model and save to disk."""
    print("🚀 Starting model training...")

    # Generate training data
    all_expenses = generate_synthetic_training_data()

    # Create features
    X, y = create_features(all_expenses.tolist())
    print(f"📊 Training on {len(X)} samples with {X.shape[1]} features")

    # Create pipeline: Polynomial features + Linear Regression
    # Polynomial features capture non-linear spending patterns
    model = Pipeline([
        ("poly", PolynomialFeatures(degree=2, include_bias=False)),
        ("linear", LinearRegression()),
    ])

    # Cross-validation to check performance
    scores = cross_val_score(model, X, y, cv=5, scoring="r2")
    print(f"✅ Cross-validation R² scores: {scores.round(3)}")
    print(f"✅ Mean R²: {scores.mean():.3f} (+/- {scores.std():.3f})")

    # Train on all data
    model.fit(X, y)

    # Save model
    model_path = os.path.join(MODEL_DIR, "expense_predictor.pkl")
    joblib.dump(model, model_path)
    print(f"💾 Model saved to: {model_path}")

    # Save feature metadata
    metadata = {
        "feature_names": [
            "last_month",
            "two_months_ago",
            "three_months_ago",
            "rolling_avg_3m",
            "mom_change",
            "volatility",
        ],
        "model_type": "PolynomialRegression",
        "r2_mean": float(scores.mean()),
    }
    metadata_path = os.path.join(MODEL_DIR, "metadata.pkl")
    joblib.dump(metadata, metadata_path)

    print("\n🎉 Training complete!")
    return model


if __name__ == "__main__":
    train_and_save_model()