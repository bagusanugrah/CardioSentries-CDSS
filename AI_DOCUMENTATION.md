# CardioSentries CDSS — AI Documentation

> Sistem Diagnostik Bantuan Keputusan (CDSS) untuk mendeteksi risiko penyakit jantung koroner menggunakan Machine Learning.

---

## Table of Contents

- [Overview](#overview)
- [Dataset](#dataset)
- [Model Architecture](#model-architecture)
- [Pipeline](#pipeline)
- [API Endpoint](#api-endpoint)
- [Model Performance](#model-performance)
- [Feature Glossary](#feature-glossary)
- [Inference Guide](#inference-guide)
- [Retraining](#retraining)
- [Deployment](#deployment)

---

## Overview

Sistem ini adalah **Classifier Binary** yang memprediksi apakah seorang pasien memiliki risiko penyakit jantung koroner (**Risiko Tinggi** / **Risiko Rendah**) berdasarkan 13 fitur klinis.

- **Tugas**: Klasifikasi Binari (Ada penyakit vs Tidak ada penyakit)
- **Algoritma**: Logistic Regression
- **Framework**: scikit-learn
- **Preprocessing**: StandardScaler (Standard Normal)
- **Output**: Kelas prediksi + probabilitas risiko (persentase)

---

## Dataset

- **Sumber**: UCI Heart Disease Dataset (menggabungkan Cleveland, Hungary, Switzerland, dan VA Long Beach)
- **File**: `ai-service/heart_disease_uci.csv`
- **Kolom asli**: Lebih dari 75 fitur (multi-dataset)
- **Fitur yang digunakan**: 13 fitur klinis relevan
- **Label asli**: `num` (0-4, derajat keparahan)
- **Label yang dipakai**: Biner — `0` = No Disease, `1` = Any Disease (`num > 0`)

### Preprocessing Dataset

```python
data = data.drop_duplicates()       # Hapus duplikat baris
data = data.dropna()                # Hapus baris dengan nilai null
```

Encoding kategorikal dilakukan via **Label Encoding** (`sklearn.preprocessing.LabelEncoder` secara implisit) untuk kolom string: `sex`, `cp`, `fbs`, `restecg`, `exang`, `slope`, `ca`, `thal`.

Kolom yang dihapus sebelum training:

| Kolom | Alasan |
|---|---|
| `id` | Identifier baris, bukan fitur |
| `dataset` | Nama sumber dataset, tidak relevan untuk prediksi |
| `num` (asli) | Digabung jadi label biner |

---

## Model Architecture

```
┌─────────────────────────┐
│   13 Input Features     │  (numerical, scaled)
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│   StandardScaler        │  (z-score normalization)
│   ��=0, σ=1 per feature  │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│   Logistic Regression   │
│   C=1.0, max_iter=1000  │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│   Sigmoid → Probability │  P(class=1)
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│   Threshold @ 0.5       │
│   0 = Risiko Rendah     │
│   1 = Risiko Tinggi     │
└─────────────────────────┘
```

### Hyperparameter

| Parameter | Nilai |
|---|---|
| Algorithm | Logistic Regression (L2 penalty) |
| Regularization C | 1.0 (default) |
| Max Iterations | 1000 |
| Solver | lbfgs (default) |
| Threshold | 0.5 |

---

## Pipeline

### Training Pipeline (`model_train.py`)

```
Raw CSV
  → Drop duplicates + NaN
  → Label Encode categorical columns
  → Drop id, dataset, num kolom
  → Binarize target: num==0 vs num>0
  → Train/Test Split (80/20, stratified)
  → StandardScaler (fit on train, transform both)
  → Train LogisticRegression
  → Evaluate (AUC, Accuracy, Confusion Matrix, Classification Report)
  → Save: heart_model.pkl, heart_scaler.pkl
  → Save: static/roc.png, static/metrics.json
```

### Inference Pipeline (`main.py`)

```
User Input (JSON)
  → Validate schema (Pydantic)
  → Encode sex: "male"/"1" → 1, else → 0
  → Array: [age, sex_val, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal]
  → StandardScaler.transform()
  → model.predict() → kelas (0/1)
  → model.predict_proba() → P(class=1)
  → Output: prediction_class, result_text, probability_percent
```

---

## API Endpoint

### POST `/predict`

Menjalankan prediksi menggunakan model yang sudah dimuat.

**Base URL**: `http://localhost:8000`

#### Request

```json
{
  "age": 60,
  "sex": "male",
  "cp": 3,
  "trestbps": 145,
  "chol": 294,
  "fbs": 1,
  "restecg": 2,
  "thalach": 150,
  "exang": 0,
  "oldpeak": 2.3,
  "slope": 0,
  "ca": 2,
  "thal": 3
}
```

#### Success Response

```json
{
  "status": "success",
  "prediction_class": 1,
  "result_text": "Risiko Tinggi",
  "probability_percent": 78.5
}
```

#### Error Responses

| Status | Detail |
|---|---|
| 500 | `Model not loaded` — file model belum ada di direktori |
| 400 | `error message` — input tidak valid atau format salah |

#### Validasi Input (Pydantic Schema)

Semua field wajib. Tipe data ditolak jika tidak sesuai (misal string dikirim ke field float).

| Field | Tipe | Wajib |
|---|---|---|
| `age` | float | Yes |
| `sex` | string | Yes |
| `cp` | float | Yes |
| `trestbps` | float | Yes |
| `chol` | float | Yes |
| `fbs` | float | Yes |
| `restecg` | float | Yes |
| `thalach` | float | Yes |
| `exang` | float | Yes |
| `oldpeak` | float | Yes |
| `slope` | float | Yes |
| `ca` | float | Yes |
| `thal` | float | Yes |

---

## Model Performance

Diukur pada test set (20% data, 60 sampel) dengan stratified split.

| Metric | Nilai |
|---|---|
| **Accuracy** | 83.33% |
| **AUC-ROC** | 0.9230 |

### Per-Class Metrics

| Class | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| **0** (No Disease) | 0.824 | 0.875 | 0.848 | 32 |
| **1** (Disease) | 0.846 | 0.786 | 0.815 | 28 |

| Macro Avg | Precision | Recall | F1-Score |
|---|---|---|---|
| | 0.835 | 0.830 | 0.832 |

| Weighted Avg | Precision | Recall | F1-Score |
|---|---|---|---|
| | 0.834 | 0.833 | 0.833 |

**Interpretasi:**
- **AUC 0.923** menunjukkan kemampuan diskriminasi model yang sangat baik — model membedakan antara pasien sakit dan sehat dengan akurat.
- **Recall kelas 0 (87.5%)** lebih tinggi daripada recall kelas 1 (78.6%), berarti model lebih andal mendeteksi pasien *sehat* daripada pasien *sakit*.
- **Precision yang seimbang** (82.4% vs 84.6%) menunjukkan sedikit bias ke arah kelas 1.
- Ukuran test set yang kecil (60 sampel) berarti metrik ini estimasi kasar — performa pada data produksi mungkin berbeda.

---

## Feature Glossary

Setiap fitur klinis yang digunakan model, beserta penjelasan dan range nilai yang didukung.

| Fitur | Nama Klinis | Range | Keterangan |
|---|---|---|---|
| `age` | Age | 29–77 | Usia pasien dalam tahun |
| `sex` | Sex | `male`/`female` atau `1`/`0` | Jenis kelamin. `"male"` atau `"1"` → encoded ke `1`, selain itu → `0` |
| `cp` | Chest Pain Type | 0–3 | 0=Asymptomatic, 1=Atypical Angina, 2=Non-anginal Pain, 3=Typical Angina |
| `trestbps` | Resting Blood Pressure | 80–200 mmHg | Tekanan darah saat istirahat |
| `chol` | Serum Cholesterol | 100–564 mg/dl | Kolesterol serum |
| `fbs` | Fasting Blood Sugar | 0–1 | > 120 mg/dl = 1, sebaliknya = 0 |
| `restecg` | Resting ECG | 0–2 | 0=Normal, 1=ST-T abnormal, 2=Probable/Definite Left Ventricular Hypertrophy |
| `thalach` | Max Heart Rate | 71–202 bpm | Detak jantung maksimum yang dicapai saat exercise |
| `exang` | Exercise-Induced Angina | 0–1 | Ya = 1, Tidak = 0 |
| `oldpeak` | ST Depression | -2.6–6.2 | ST segment depression relative to rest (indikasi iskemia) |
| `slope` | Slope of ST Segment | 0–2 | 0=Upsloping, 1=Flat, 2=Downsloping |
| `ca` | Major Vessels | 0–3 | Jumlah pembuluh darah besar (0–3) yang diwarnai oleh fluoroscopy |
| `thal` | Thalassemia | 0–3 | 0=Normal, 1=Fixed Defect, 2=Reversible Defect, 3=Unknown |

---

## Inference Guide

### Cara Menggunakan

**Langkah 1 — Training (sekali saja)**

```bash
cd ai-service
python model_train.py
```

Output yang dihasilkan:
- `heart_model.pkl` — Model Logistic Regression yang sudah trained
- `heart_scaler.pkl` — Scaler untuk normalisasi input
- `static/roc.png` — Kurva ROC visual
- `static/metrics.json` — Metrik evaluasi model

**Langkah 2 — Jalankan Server**

```bash
cd ai-service
uvicorn main:app --port 8000 --reload
```

Server berjalan di `http://localhost:8000`. Konfirmasi di log: `AI Engine Ready.`

**Langkah 3 — Kirim Request Prediksi**

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 60,
    "sex": "male",
    "cp": 3,
    "trestbps": 145,
    "chol": 294,
    "fbs": 1,
    "restecg": 2,
    "thalach": 150,
    "exang": 0,
    "oldpeak": 2.3,
    "slope": 0,
    "ca": 2,
    "thal": 3
  }'
```

**Langkah 4 — Baca Hasil**

```json
{
  "status": "success",
  "prediction_class": 1,
  "result_text": "Risiko Tinggi",
  "probability_percent": 78.5
}
```

- `prediction_class` 1 = Pasien memiliki tanda penyakit jantung
- `probability_percent` = Tingkat keyakinan model (0-100%)
- `result_text` = Tampilan manusia yang mudah dibaca

### Integrasi dengan Backend

Backend (`backend-service/server.js`) mengirim data medis otomatis ke AI service melalui:

```javascript
const aiResponse = await axios.post(
  process.env.AI_SERVICE_URL,  // default: http://localhost:8000
  medical_data
);
```

Hasil (`prediction_result`, `probability`) disimpan ke database MySQL dan ditampilkan di dashboard dokter.

### Integrasi Publik

Endpoint `/api/public/predict` pada backend mem-proxy request publik langsung ke AI service tanpa autentikasi, mendukung integrasi RS lain.

---

## Retraining

### Kapan Retraining Diperlukan

- Dataset baru tersedia (data pasien tambahan)
- Performa model di produksi menurun (drift detection)
- Fitur baru ditambahkan ke sistem
- Evaluasi periodik (disarankan setiap 3-6 bulan)

### Prosedur Retraining

```bash
# 1. Pastikan file data terbaru tersedia
#    Update heart_disease_uci.csv atau ganti dengan dataset baru

# 2. Jalankan training ulang
cd ai-service
python model_train.py

# 3. Verifikasi output file
#    - heart_model.pkl  (model baru)
#    - heart_scaler.pkl (scaler baru)
#    - static/metrics.json  (metrik baru)

# 4. Restart AI service agar model baru dimuat
#    Ctrl+C lalu:
uvicorn main:app --port 8000 --reload
```

Model baru otomatis dimuat saat server startup (cek keberadaan `heart_model.pkl` dan `heart_scaler.pkl`).

---

## Deployment

### Environment

| Komponen | Versi | Port |
|---|---|---|
| Python | 3.8+ | — |
| FastAPI | latest | 8000 |
| Uvicorn | latest | 8000 |
| scikit-learn | latest | — |
| joblib | latest | — |
| numpy | latest | — |
| pandas | latest | — |

### Dependencies

```
fastapi
uvicorn
scikit-learn
pandas
numpy
joblib
```

### Struktur File

```
ai-service/
├── main.py                  # FastAPI server (API endpoint)
├── model_train.py           # Script training & evaluasi
├── heart_disease_uci.csv    # Dataset sumber
├── heart_model.pkl          # Model yang sudah trained
├── heart_scaler.pkl         # Scaler untuk preprocessing
├── static/
│   ├── metrics.json         # Metrik evaluasi
│   └── roc.png              # Visualisasi ROC curve
└── .gitignore
```

### Production Checklist

- [ ] File `heart_model.pkl` dan `heart_scaler.pkl` ada di direktori
- [ ] Model sudah dire-evaluasi pada data terbaru
- [ ] Uvicorn dijalankan dengan worker yang sesuai (gunicorn + uvicorn workers)
- [ ] Rate limiting ditambahkan di depan FastAPI (reverse proxy)
- [ ] Logging terstruktur diaktifkan (structlog / python-json-logger)
- [ ] Health check endpoint ditambahkan (`/health`)
- [ ] Model versioning diterapkan untuk roll back jika perlu
