import joblib
import pickle
from pathlib import Path

ARTIFACT_DIR = Path(__file__).parent / 'saved_models'
try:
    best_rf_heat = joblib.load(ARTIFACT_DIR / 'best_rf_heating.pkl')
    best_rf_cool = joblib.load(ARTIFACT_DIR / 'best_rf_cooling.pkl')
    scaler = joblib.load(ARTIFACT_DIR / 'scaler.pkl')
    with open(ARTIFACT_DIR / 'model_info.pkl', 'rb') as f:
        model_info = pickle.load(f)
    print('Models loaded successfully')
    print('Features:', len(model_info["features"]))
    print('Heating R2:', model_info["model_heating_r2"])
    print('Cooling R2:', model_info["model_cooling_r2"])
    print('Features:', model_info["features"][:5])
except Exception as e:
    print('Error:', e)