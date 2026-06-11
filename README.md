<div align="center">
  <h1>🛡️ CardioSentries CDSS</h1>
  <p><b>Clinical Decision Support System untuk Deteksi Risiko Penyakit Jantung Koroner</b></p>
  <p>AI-Based SDGs Health Project — Cloud Native Architecture</p>
  <br/>
</div>

---

## 📖 Project Overview

CardioSentries adalah Sistem Pendukung Keputusan Klinis berbasis AI untuk deteksi dini Penyakit Jantung Koroner (CHD). Aplikasi ini menerapkan arsitektur Cloud Native dengan 8 komponen wajib (Frontend, Backend/API, Database, Object Storage, Docker, CDN, VPC, AI Service).

**SDGs Alignment:** Good Health and Well-being (Goal 3)

---

## 🏗️ Arsitektur

```
Internet → Cloud CDN → Cloud Run (Frontend) → Cloud Run (Backend API)
                                         ↕ VPC               ↕ VPC Connector
                                                    Cloud SQL (MySQL)
Cloud Run (AI Service) ←↕ VPC Connector (sklearn Heart Disease Model)
Cloud Storage (GCS Bucket) ← PDF Report Storage
```

---

## 📂 Struktur Repositori

```
├── ai-service/           # Python/FastAPI AI Engine (scikit-learn)
│   ├── main.py           # API endpoint /predict
│   ├── model_train.py    # Training script
│   ├── heart_model.pkl   # Trained RandomForest model
│   ├── heart_scaler.pkl  # StandardScaler
│   ├── requirements.txt
│   └── Dockerfile
├── backend-service/      # Node.js/Express API + JWT Auth
│   ├── server.js         # REST API (Auth, CRUD, PDF)
│   ├── models.js         # Sequelize models (Doctor, PatientRecord, PrintHistory)
│   ├── services/         # PDF generator + GCS storage service
│   ├── package.json
│   └── Dockerfile
├── frontend-client/      # React + Vite SPA
│   ├── src/              # Components, Pages, API integration
│   ├── package.json
│   └── Dockerfile
├── db/
│   └── init.sql          # Database schema
├── docker-compose.yml    # Local development orchestration
├── cloudbuild.yaml       # CI/CD pipeline (Cloud Build)
├── AI_DOCUMENTATION.md   # Full AI/ML documentation
├── API_DOCUMENTATION.md  # Full REST API documentation
└── README.md             # This file
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (optional, for non-Docker development)
- Python 3.12+ (optional, for non-Docker development)

### Using Docker Compose (Recommended)

```bash
# Clone this repository
git clone https://github.com/bagusanugrah/CardioSentries-CDSS.git
cd CardioSentries-CDSS

# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:5173
```

### Manual Setup (Without Docker)

1. **Database** — Create MySQL database `cardio_db`
2. **AI Service:**
   ```bash
   cd ai-service
   pip install -r requirements.txt
   uvicorn main:app --port 8000 --reload
   ```
3. **Backend:**
   ```bash
   cd backend-service
   npm install
   # Edit .env → set DB_HOST=localhost
   node server.js
   ```
4. **Frontend:**
   ```bash
   cd frontend-client
   npm install
   npm run dev
   ```

---

## ☁️ Deploy to Google Cloud Platform

### Prerequisites

- `gcloud` CLI installed and authenticated
- `docker` installed locally

### Step 1: Setup GCP Project

```bash
gcloud projects create YOUR_PROJECT_ID
gcloud config set project YOUR_PROJECT_ID
gcloud auth login
gcloud services enable \
  compute.googleapis.com run.googleapis.com sql.googleapis.com \
  storage.googleapis.com artifactregistry.googleapis.com \
  vpcaccess.googleapis.com cloudbuild.googleapis.com
```

### Step 2: Create Infrastructure (Manual or Terraform)

See `../deploy/terraform/` for Infrastructure as Code.

### Step 3: Deploy with Docker

```bash
# Authenticate Docker
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build & Push images
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cardio-sentries-repo/ai-service:latest ./ai-service/
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cardio-sentries-repo/ai-service:latest

docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cardio-sentries-repo/backend-api:latest ./backend-service/
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cardio-sentries-repo/backend-api:latest

docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cardio-sentries-repo/frontend:latest ./frontend-client/
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cardio-sentries-repo/frontend:latest
```

### Step 4: Deploy Services to Cloud Run

```bash
# AI Service
gcloud run deploy ai-service \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cardio-sentries-repo/ai-service:latest \
  --region us-central1 --platform managed --allow-unauthenticated --port 8000

# Backend API (requires VPC connector + Cloud SQL)
gcloud run deploy backend-api \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cardio-sentries-repo/backend-api:latest \
  --region us-central1 --platform managed --allow-unauthenticated \
  --port 3000 --memory 512Mi \
  --vpc-connector vpc-connector-backend \
  --set-cloud-sql-instances=YOUR_PROJECT_ID:us-central1:cardio-db

# Frontend
gcloud run deploy frontend \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cardio-sentries-repo/frontend:latest \
  --region us-central1 --platform managed --allow-unauthenticated --port 80
```

### Step 5: CI/CD

```bash
gcloud builds submit
```

---

## 🤖 AI Model

- **Algorithm:** Random Forest Classifier (scikit-learn)
- **Dataset:** UCI Heart Disease Dataset (303 samples, 13 features)
- **Features:** Age, Sex, Chest Pain Type, Resting BP, Cholesterol, Fasting Blood Sugar, Resting ECG, Max Heart Rate, Exercise Angina, ST Depression, Slope, Major Vessels, Thalassemia
- **Training:** See `ai-service/model_train.py`

### Test AI Endpoint

```bash
curl -X POST https://ai-service-XXXXX.a.run.app/predict \
  -H "Content-Type: application/json" \
  -d '{"age":63,"sex":"male","cp":3,"trestbps":145,"chol":233,"fbs":1,"restecg":0,"thalach":150,"exang":0,"oldpeak":2.3,"slope":0,"ca":0,"thal":6}'
```

---

## 📊 Database Schema

| Table | Purpose |
|---|---|
| `Doctors` | Doctor accounts (NIP, name, password) |
| `PatientRecords` | Patient predictions + medical data |
| `PrintHistories` | PDF report tracking per doctor |

See `db/init.sql` for full schema.

---

## 🔐 Default Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin_pusat` | `password` |

> ⚠️ **IMPORTANT:** Change these in production!

---

## 📄 Deliverables

1. **Laporan PDF** — Background, System Analysis, Cloud Architecture, AI Integration, CI/CD, Deployment Tutorial, Monitoring, Conclusion (min. 20 pages)
2. **GitHub Repository** — This repository
3. **Draft HKI** — Intellectual Property Registration Draft
4. **Video Presentasi** — 10-15 minutes, single recording (NO CUT NO EDIT)

---

## 📚 Dokumentasi Tambahan

- [API Documentation](./API_DOCUMENTATION.md)
- [AI Documentation](./AI_DOCUMENTATION.md)
