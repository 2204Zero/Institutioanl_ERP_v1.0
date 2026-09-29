# AI & Machine Learning Predictive Engine Architecture (Phase 11)

## 1. Overview
The AI & Machine Learning Predictive Engine (`src/types/analyticsTypes.ts`, `src/services/analyticsService.ts`) provides predictive risk scores, automated recommendations, and proactive academic alerts for institutional leaders.

---

## 2. Predictive Models & Inference Pipeline

```
  Student LMS Data  ──┐
  Attendance Logs   ──┼──> Feature Extractor ──> ML Inference Model ──> Risk Score & Recommendations
  Financial Dues    ──┘     (Min-Max Scale)     (RandomForest/XGBoost)
```

### Supported Predictive Services
1. **Student Dropout Risk**: Identifies candidates at risk of dropping out based on low attendance (<65%), pending fee dues, and accumulated backlogs.
2. **Fee Default Prediction**: Analyzes historical payment modes and delay intervals to flag accounts at risk of default.
3. **Low Attendance Warning**: Predicts future attendance drops before mid-term cutoff dates.
4. **Student Performance Prediction**: Models expected end-term CGPA and nominates candidates for honors research grants.

---

## 3. Feature Importance & Risk Scoring
Each prediction record includes:
- **Target Entity**: Student or Faculty member details.
- **Risk Level**: Classified as `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`.
- **Confidence Score**: Percentage model confidence (e.g. 96.8%).
- **Feature Importance Weights**: Top contributing factors (e.g., Attendance <65% contributing 45% to dropout score).
- **Action Recommendation**: Specific mitigation steps (e.g., Schedule academic counseling).
