# train_and_save.py
import os
import json
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_curve, roc_auc_score, classification_report, confusion_matrix

# Pastikan folder static ada
os.makedirs("static", exist_ok=True)

# 1. Load dataset
data = pd.read_csv("heart_disease_uci.csv")
print("Data shape (raw):", data.shape)

# 2. Preprocessing: hapus duplikat, hapus null, encoding categorical value
data = data.drop_duplicates()
print("Setelah drop_duplicates:", data.shape)
data = data.dropna()
print("Setelah dropna:", data.shape)

# Encoding categorical value
# Kolom: sex, cp, fbs, restecg, exang, slope, ca, thal
cat_cols = ["sex", "cp", "fbs", "restecg", "exang", "slope", "ca", "thal"]
for col in cat_cols:
    if data[col].dtype == object:
        data[col] = data[col].astype(str)
    # Label encoding jika string, jika sudah int biarkan
    if not np.issubdtype(data[col].dtype, np.number):
        data[col] = data[col].astype('category').cat.codes

print("Setelah encoding kategorikal:", data.dtypes)




# 3. Fitur & target
drop_cols = ['num', 'id', 'dataset']
X = data.drop([col for col in drop_cols if col in data.columns], axis=1)
y_raw = data['num'] if 'num' in data.columns else data['target']
# Binarize: 0 = no heart disease, 1 = any disease
y = (y_raw != 0).astype(int)
print("Distribusi target biner:", y.value_counts().sort_index())

# 3. Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 4. Standardisasi
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)



# 5. Train model (binary)
model = LogisticRegression(max_iter=1000)
model.fit(X_train_scaled, y_train)

# 6. Predict & eval (binary)
y_pred = model.predict(X_test_scaled)
y_prob = model.predict_proba(X_test_scaled)[:, 1]
auc = roc_auc_score(y_test, y_prob)
print("AUC:", auc)
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# 7. Save model & scaler
joblib.dump(model, "heart_model.pkl")
joblib.dump(scaler, "heart_scaler.pkl")



# 8. Save ROC plot (binary)
plt.figure(figsize=(6,6))
fpr, tpr, _ = roc_curve(y_test, y_prob)
plt.plot(fpr, tpr, label=f'ROC Curve (AUC = {auc:.3f})')
plt.plot([0,1], [0,1], linestyle='--')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve - Heart Dataset (Binary)')
plt.legend(loc='lower right')
plt.tight_layout()
plt.savefig("static/roc.png", dpi=150)
plt.close()


# 9. Save metrics (AUC, accuracy, per-class report)
from sklearn.metrics import accuracy_score
acc = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred, output_dict=True)
metrics = {
    "auc": float(auc) if auc is not None else None,
    "accuracy": float(acc),
    "n_test": int(len(y_test)),
    "report": report
}
with open("static/metrics.json", "w") as f:
    json.dump(metrics, f)

print("Saved: heart_model.pkl, heart_scaler.pkl, static/roc.png, static/metrics.json")
