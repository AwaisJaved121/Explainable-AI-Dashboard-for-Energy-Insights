import os
import sys
import warnings
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from xgboost import XGBRegressor


warnings.filterwarnings('ignore')

# ─── Paths ──────────────────────────────────────────────────────────────
DATA_PATH = Path("data/energy_efficiency_data.csv")
SAVE_DIR = Path("backend/saved_models")
SAVE_DIR.mkdir(parents=True, exist_ok=True)

# ─── Load & Prepare Data ────────────────────────────────────────────────
def load_and_prepare_data():
    """Load UCI Energy Efficiency dataset and prepare features"""
    print("[LOAD] Loading dataset...")
    
    # Try local file first, then download
    if DATA_PATH.exists():
        df = pd.read_csv(DATA_PATH)
    else:
        print("   Downloading from UCI...")
        url = "https://archive.ics.uci.edu/ml/machine-learning-databases/00242/ENB2012_data.xlsx"
        df = pd.read_excel(url)
        DATA_PATH.parent.mkdir(exist_ok=True)
        df.to_csv(DATA_PATH, index=False)
        print(f"   Saved to {DATA_PATH}")
    
    # Rename columns
    column_names = {
        'X1': 'Relative_Compactness', 'X2': 'Surface_Area', 'X3': 'Wall_Area',
        'X4': 'Roof_Area', 'X5': 'Overall_Height', 'X6': 'Orientation',
        'X7': 'Glazing_Area', 'X8': 'Glazing_Distribution',
        'Y1': 'Heating_Load', 'Y2': 'Cooling_Load'
    }
    df.rename(columns=column_names, inplace=True)
    print(f"   Shape: {df.shape}")
    return df

def encode_features(df):
    """One-hot encode categorical features"""
    print("[ENCODE] Encoding categorical features...")
    df_encoded = pd.get_dummies(df, columns=['Orientation', 'Glazing_Distribution'], prefix=['Ori', 'GD'])
    print(f"   Features after encoding: {df_encoded.shape[1]}")
    return df_encoded

def prepare_data(df_encoded):
    """Split features and targets, create train/test split"""
    print("[SPLIT] Preparing train/test split...")
    
    X = df_encoded.drop(['Heating_Load', 'Cooling_Load'], axis=1)
    y_heating = df_encoded['Heating_Load']
    y_cooling = df_encoded['Cooling_Load']
    
    # Same split for both targets
    X_train, X_test, y_train_heat, y_test_heat = train_test_split(
        X, y_heating, test_size=0.2, random_state=42
    )
    train_idx = X_train.index
    test_idx = X_test.index
    y_train_cool = y_cooling.loc[train_idx]
    y_test_cool = y_cooling.loc[test_idx]
    
    print(f"   Train: {X_train.shape[0]}, Test: {X_test.shape[0]}")
    return X_train, X_test, y_train_heat, y_test_heat, y_train_cool, y_test_cool, X.columns.tolist()

def scale_features(X_train, X_test):
    """Standardize features"""
    print("[SCALE] Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    return X_train_scaled, X_test_scaled, scaler

# ─── Model Training ─────────────────────────────────────────────────────
def train_models(X_train, y_train_heat, y_train_cool):
    """Train and tune models"""
    print("\n[TRAIN] Training models...")
    
    models = {
        'Linear Regression': LinearRegression(),
        'Ridge Regression': Ridge(alpha=1.0),
        'Lasso Regression': Lasso(alpha=0.1),
        'Decision Tree': DecisionTreeRegressor(random_state=42),
        'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
        'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42),
        'XGBoost': XGBRegressor(n_estimators=100, random_state=42, verbosity=0)
    }
    
    # Quick evaluation
    print("\n   Initial model comparison:")
    for name, model in models.items():
        model.fit(X_train, y_train_heat)
        pred = model.predict(X_train)
        r2 = r2_score(y_train_heat, pred)
        print(f"   {name:25s} - Train R²: {r2:.4f}")
    
    # Tune Random Forest
    print("\n[TUNE] Hyperparameter tuning (Random Forest)...")
    param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [5, 10, 15, None],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4]
    }
    
    rf = RandomForestRegressor(random_state=42)
    
    grid_heat = GridSearchCV(rf, param_grid, cv=5, scoring='r2', n_jobs=-1)
    grid_heat.fit(X_train, y_train_heat)
    
    grid_cool = GridSearchCV(rf, param_grid, cv=5, scoring='r2', n_jobs=-1)
    grid_cool.fit(X_train, y_train_cool)
    
    print(f"   Best params (heating): {grid_heat.best_params_}")
    print(f"   Best CV R² (heating):  {grid_heat.best_score_:.4f}")
    print(f"   Best params (cooling): {grid_cool.best_params_}")
    print(f"   Best CV R² (cooling):  {grid_cool.best_score_:.4f}")
    
    return grid_heat.best_estimator_, grid_cool.best_estimator_

def evaluate_models(model_heat, model_cool, X_test, y_test_heat, y_test_cool):
    """Evaluate on test set"""
    print("\n[EVAL] Test set evaluation:")
    
    y_pred_heat = model_heat.predict(X_test)
    y_pred_cool = model_cool.predict(X_test)
    
    for name, y_true, y_pred in [
        ("Heating", y_test_heat, y_pred_heat),
        ("Cooling", y_test_cool, y_pred_cool)
    ]:
        mse = mean_squared_error(y_true, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_true, y_pred)
        r2 = r2_score(y_true, y_pred)
        print(f"   {name:8s} - RMSE: {rmse:.4f}, MAE: {mae:.4f}, R²: {r2:.4f}")
    
    return y_pred_heat, y_pred_cool

# ─── VIF & Outlier Analysis ────────────────────────────────────────────
def compute_vif(df):
    """Compute Variance Inflation Factors"""
    from statsmodels.stats.outliers_influence import variance_inflation_factor
    X_vif = df[['Relative_Compactness', 'Surface_Area', 'Wall_Area', 'Roof_Area',
                'Overall_Height', 'Orientation', 'Glazing_Area', 'Glazing_Distribution']]
    vif_data = pd.DataFrame()
    vif_data["Feature"] = X_vif.columns
    vif_data["VIF"] = [variance_inflation_factor(X_vif.values, i) for i in range(X_vif.shape[1])]
    return vif_data

def analyze_outliers(df):
    """IQR-based outlier analysis"""
    outlier_summary = {}
    for col in df.columns:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR
        outliers = df[(df[col] < lower) | (df[col] > upper)]
        outlier_summary[col] = {
            'Lower_Bound': lower, 'Upper_Bound': upper,
            'Outlier_Count': len(outliers),
            'Outlier_Percentage': (len(outliers) / len(df)) * 100
        }
    return pd.DataFrame(outlier_summary).T

# ─── Save Artifacts ────────────────────────────────────────────────────
def save_artifacts(model_heat, model_cool, scaler, feature_names,
                   y_test_heat, y_pred_heat, y_test_cool, y_pred_cool,
                   df, df_encoded):
    """Save all model artifacts for deployment"""
    print("\n[SAVE] Saving artifacts...")
    
    # Models
    joblib.dump(model_heat, SAVE_DIR / "best_rf_heating.pkl")
    joblib.dump(model_cool, SAVE_DIR / "best_rf_cooling.pkl")
    joblib.dump(scaler, SAVE_DIR / "scaler.pkl")
    
    # Model info
    vif_data = compute_vif(df)
    outlier_df = analyze_outliers(df)
    
    model_info = {
        'features': feature_names,
        'targets': ['Heating_Load', 'Cooling_Load'],
        'model_heating_r2': float(r2_score(y_test_heat, y_pred_heat)),
        'model_cooling_r2': float(r2_score(y_test_cool, y_pred_cool)),
        'vif_results': vif_data.to_dict(),
        'outlier_analysis': outlier_df.to_dict(),
        'one_hot_encoding': {
            'Orientation': sorted(df['Orientation'].unique().tolist()),
            'Glazing_Distribution': sorted(df['Glazing_Distribution'].unique().tolist())
        }
    }
    
    with open(SAVE_DIR / "model_info.pkl", "wb") as f:
        pickle.dump(model_info, f)
    
    print(f"   ✅ Saved to {SAVE_DIR}")
    for f in SAVE_DIR.iterdir():
        print(f"      - {f.name}")

# ─── Main ──────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("ENERGY EFFICIENCY XAI - MODEL TRAINING")
    print("=" * 60)
    
    # Load data
    df = load_and_prepare_data()
    
    # Encode
    df_encoded = encode_features(df)
    
    # Split
    X_train, X_test, y_train_heat, y_test_heat, y_train_cool, y_test_cool, feature_names = prepare_data(df_encoded)
    
    # Scale
    X_train_scaled, X_test_scaled, scaler = scale_features(X_train, X_test)
    
    # Train
    model_heat, model_cool = train_models(X_train_scaled, y_train_heat, y_train_cool)
    
    # Evaluate
    y_pred_heat, y_pred_cool = evaluate_models(
        model_heat, model_cool, X_test_scaled, y_test_heat, y_test_cool
    )
    
    # Cross-validation
    print("\n[CV] Cross-validation (5-fold):")
    cv_heat = cross_val_score(model_heat, X_train_scaled, y_train_heat, cv=5, scoring='r2')
    cv_cool = cross_val_score(model_cool, X_train_scaled, y_train_cool, cv=5, scoring='r2')
    print(f"   Heating: {cv_heat.mean():.4f} ± {cv_heat.std():.4f}")
    print(f"   Cooling: {cv_cool.mean():.4f} ± {cv_cool.std():.4f}")
    
    # Save
    save_artifacts(model_heat, model_cool, scaler, feature_names,
                   y_test_heat, y_pred_heat, y_test_cool, y_pred_cool,
                   df, df_encoded)
    
    print("\n" + "=" * 60)
    print("[OK] TRAINING COMPLETE!")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Run backend:  cd backend && python -m uvicorn main:app --reload")
    print("  2. Run frontend: cd frontend && npm start")
    print("  3. Or use: start.bat (Windows)")

if __name__ == "__main__":
    main()