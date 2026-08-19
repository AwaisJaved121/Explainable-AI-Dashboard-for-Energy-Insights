# Energy Efficiency XAI Dashboard

An **Explainable AI Dashboard for Energy Insights** — predicts building heating/cooling loads with SHAP, LIME, counterfactuals, anomaly detection, and design optimization.

- **ML Models**: Tuned Random Forest (Heating R² = 0.9973, Cooling R² = 0.9555)
- **Explainability**: SHAP, LIME, feature importance, counterfactuals
- **Advanced XAI**: Anomaly detection, design optimization, monthly load prediction
- **Evaluation**: Built-in 5-step questionnaire in the Questionnaire tab
- **Tech Stack**: FastAPI + React + Recharts

## 🚀 Quick Start

### Option 1: Windows Batch Script
```
start.bat
```

### Option 2: Manual Start
**Backend (Terminal 1):**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm install
npm start
```

## 📁 Project Structure

```
Energy_Dashboard/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   ├── questionnaire_responses.json  # Questionnaire submissions
│   └── saved_models/           # Trained model artifacts
│       ├── best_rf_heating.pkl
│       ├── best_rf_cooling.pkl
│       ├── scaler.pkl
│       └── model_info.pkl
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── context/            # React contexts
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── train_models.py             # Model training script
├── start.bat                   # Windows startup script
```

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/predict` | POST | Predict heating/cooling loads (monthly or annual) |
| `/feature-importance` | GET | Global feature importance |
| `/explain` | POST | Full explanation (SHAP + LIME + FI) |
| `/explain/shap` | POST | SHAP values only |
| `/explain/lime` | POST | LIME explanations only |
| `/anomaly` | POST | Anomaly detection |
| `/counterfactual` | POST | What-if counterfactual analysis |
| `/optimize` | POST | Design optimization |
| `/model/info` | GET | Model metadata (R² scores, features) |
| `/questionnaire/submit` | POST | Save evaluation questionnaire response |

## 🧠 Machine Learning Details

### Dataset
- **Source**: UCI Energy Efficiency Dataset (ENB2012)
- **Samples**: 768 buildings
- **Features**: 8 building parameters (geometry, orientation, glazing)
- **Targets**: Heating Load (Y1), Cooling Load (Y2)

### Trained Models
| Model | Heating R² | Cooling R² |
|-------|-----------|-----------|
| Tuned Random Forest | 0.9973 | 0.9555 |

### Explainability Methods
1. **SHAP (TreeExplainer)** — global & local feature contributions
2. **LIME** — local interpretable explanations
3. **Feature Importance** — built-in Random Forest importance
4. **Counterfactuals** — optimization-based "what-if" scenarios
5. **Anomaly Detection** — Isolation Forest outlier detection
6. **Design Optimization** — gradient-based parameter optimization

## 🎨 Frontend Features

### Dashboard Panels
1. **Prediction** — date period + month selection, 8 building parameters, monthly/annual load
2. **Explanation** — tabbed: Overview, SHAP, LIME, Feature Importance
3. **Model Performance** — real R² scores
4. **Anomaly Detection** — anomaly scoring with feature contributions
5. **Counterfactual Analysis** — "What changes achieve target loads?"
6. **Optimization** — find optimal building parameters
7. **Feature Importance** — interactive bar charts
8. **Prediction Accuracy** — actual vs predicted, residuals
9. **Questionnaire** — 5-step evaluation form, saves to `backend/questionnaire_responses.json`

### UI/UX
- Dark theme, responsive layout, loading states, toast notifications

## 🔬 Retraining Models

```bash
python train_models.py
```
Generates new artifacts in `backend/saved_models/` (downloads the UCI dataset if needed).

## 📊 Dissertation Alignment

| Requirement | Implementation |
|-------------|----------------|
| ML predictions | ✅ Dual-target Random Forest |
| Feature importance | ✅ Built-in + SHAP + LIME |
| Counterfactual explanations | ✅ `/counterfactual` endpoint |
| Local surrogate (LIME) | ✅ `/explain/lime` endpoint |
| Anomaly scores | ✅ Isolation Forest endpoint |
| Optimization recommendations | ✅ `/optimize` endpoint |
| FastAPI backend | ✅ Auto-generated docs |
| React frontend | ✅ Professional dashboard |
| Usability evaluation | ✅ In-app 5-step questionnaire (Questionnaire tab) |

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Models not loading | Run `python train_models.py` first |
| Port 3000 in use | `set PORT=3001 && npm start` |
| SHAP slow on first request | First call initializes explainer (cached after) |

## 📝 License

 University Dissertation
