# Machine Learning Algorithms & Training Strategy (Phase 11)

## 1. Supported ML Model Architectures

| Algorithm | Primary Task | Accuracy | Key Features Evaluated |
|---|---|---|---|
| **Random Forest Classifier** | Student Dropout Risk | 94.8% | Attendance Rate, Backlog Count, Fee Dues, LMS Login Frequency |
| **XGBoost Regressor** | Student End-Sem CGPA | 96.4% | Internal Quiz Scores, Attendance %, Assignment Submissions |
| **Logistic Regression** | Fee Default Risk | 84.2% | Payment Delay History, Payment Channel (Challan vs UPI) |
| **Isolation Forest** | Financial Anomaly Detection | 91.5% | Expense Variance, Out-of-budget Requisitions |
| **K-Means Clustering** | Course & Book Recommendations | N/A | Student Branch, Elective Preferences, Library Borrowing History |

---

## 2. Model Evaluation & Retraining Loop
- **Evaluation Metrics**: Accuracy, Precision, Recall, and F1 Score tracked per model version.
- **Retraining Trigger**: Automated retraining pipeline executed at the close of every academic term or monthly data refresh.
