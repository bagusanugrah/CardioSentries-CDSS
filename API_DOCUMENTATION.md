# CardioSentries CDSS - API Documentation

> **Base URL**: `http://localhost:3000` (Backend Manager)
> **AI Service URL**: `http://localhost:8000` (Python FastAPI)
> **Auth**: JWT Bearer Token (query string `?token=` also supported)

---

## Table of Contents

- [Authentication](#authentication)
- [Admin Endpoints](#admin-endpoints)
- [Doctor Endpoints](#doctor-endpoints)
- [Public Endpoints](#public-endpoints)
- [AI Service (Python)](#ai-service-python)
- [PDF & Print Endpoints](#pdf--print-endpoints)
- [Data Models](#data-models)
- [Error Codes](#error-codes)

---

## Authentication

### POST `/api/auth/login`

Login as Admin or Doctor. Returns a JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response (200) — Admin:**
```json
{
  "token": "jwt_token_string",
  "role": "admin",
  "user": { "name": "Super Admin" }
}
```

**Success Response (200) — Doctor:**
```json
{
  "token": "jwt_token_string",
  "role": "doctor",
  "user": { "name": "Dr. Name", "nip": "1234567890" }
}
```

**Error Response (401):**
```json
{ "msg": "Username atau Password Salah" }
```

**Token Usage:** Pass via `Authorization: Bearer <token>` header or query string `?token=<token>`.

---

## Admin Endpoints

> Requires: `Authorization: Bearer <token>` + `role: admin`

### GET `/api/admin/doctors`

List all registered doctors.

**Success Response (200):**
```json
[
  {
    "id": 1,
    "nip": "1234567890",
    "name": "Dr. Example",
    "password": "hashed"
  }
]
```

### POST `/api/admin/doctors`

Register a new doctor.

**Request Body:**
```json
{
  "nip": "1234567890",
  "name": "Dr. New Doctor",
  "password": "doctor_password"
}
```

**Success Response (200):**
```json
{
  "msg": "Dokter berhasil didaftarkan",
  "data": { /* created doctor object */ }
}
```

**Error Response (400):**
```json
{ "msg": "Gagal, mungkin NIP sudah ada?" }
```

### PUT `/api/admin/doctors/:id`

Update an existing doctor.

**Request Body:**
```json
{
  "nip": "1234567890",
  "name": "Dr. Updated Name",
  "password": "new_password"
}
```

**Success Response (200):**
```json
{
  "msg": "Data dokter berhasil diperbarui",
  "data": { /* updated doctor object */ }
}
```

**Error Response (404):**
```json
{ "msg": "Dokter tidak ditemukan" }
```

**Error Response (500):**
```json
{ "msg": "Gagal update, NIP mungkin bentrok" }
```

### DELETE `/api/admin/doctors/:id`

Remove a doctor.

**Success Response (200):**
```json
{ "msg": "Dokter berhasil dihapus" }
```

### GET `/api/admin/all-records`

View all patient records across all doctors (read-only).

**Success Response (200):**
```json
[
  {
    "id": 1,
    "patient_number": "P-001",
    "patient_name": "John Doe",
    "medical_data": { /* raw medical input */ },
    "prediction_result": "Risiko Tinggi",
    "probability": 78.5,
    "doctor_nip": "1234567890"
  }
]
```

---

## Doctor Endpoints

> Requires: `Authorization: Bearer <token>` + `role: doctor`

### GET `/api/doctor/records`

List all patient records belonging to the logged-in doctor.

**Success Response (200):**
```json
[
  {
    "id": 1,
    "patient_number": "P-001",
    "patient_name": "John Doe",
    "medical_data": { /* raw medical input */ },
    "prediction_result": "Risiko Rendah",
    "probability": 22.3,
    "doctor_nip": "1234567890"
  }
]
```

### POST `/api/doctor/predict`

Create a new patient prediction. Sends medical data to AI service, saves result.

**Request Body:**
```json
{
  "patient_number": "P-001",
  "patient_name": "John Doe",
  "medical_data": {
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
}
```

**Success Response (200):**
```json
{
  "msg": "Prediksi Selesai & Disimpan",
  "data": {
    "id": 1,
    "patient_number": "P-001",
    "patient_name": "John Doe",
    "medical_data": { /* submitted data */ },
    "prediction_result": "Risiko Tinggi",
    "probability": 78.5,
    "doctor_nip": "1234567890"
  }
}
```

**Error Response (500):**
```json
{ "msg": "Gagal menghubungi AI Service" }
```

### PUT `/api/doctor/records/:id`

Edit an existing patient record and re-run prediction.

**Request Body:**
```json
{
  "medical_data": {
    "age": 55,
    "sex": "female",
    "cp": 1,
    "trestbps": 130,
    "chol": 250,
    "fbs": 0,
    "restecg": 0,
    "thalach": 160,
    "exang": 0,
    "oldpeak": 1.0,
    "slope": 1,
    "ca": 0,
    "thal": 2
  }
}
```

**Success Response (200):**
```json
{
  "msg": "Data Updated & Re-Predicted",
  "data": { /* updated record object */ }
}
```

**Error Response (404):**
```json
{ "msg": "Record tidak ditemukan" }
```

**Error Response (500):**
```json
{ "msg": "Error update" }
```

### DELETE `/api/doctor/records/:id`

Delete a patient record.

**Success Response (200):**
```json
{ "msg": "Deleted" }
```

---

## PDF & Print Endpoints

> Requires: `Authorization: Bearer <token>` + `role: doctor`

### GET `/api/doctor/records/pdf`

Generate a PDF report of all patient records for the logged-in doctor.

**Success Response (200):**
```json
{
  "msg": "PDF berhasil dibuat",
  "mode": "dev",
  "filename": "dokter_1234567890_patients.pdf",
  "storagePath": "/path/to/file.pdf",
  "count": 15,
  "lastPrintedAt": "2025-06-10T10:30:00.000Z"
}
```

**Error Response (500):**
```json
{ "msg": "Gagal membuat PDF", "error": "error details" }
```

### GET `/api/doctor/print-history`

Get the last print history record for the logged-in doctor.

**Success Response (200):**
```json
{
  "history": {
    "id": 1,
    "doctor_nip": "1234567890",
    "filename": "dokter_1234567890_patients.pdf",
    "storage_path": "/path/to/file.pdf",
    "mode": "dev",
    "last_printed_at": "2025-06-10T10:30:00.000Z"
  }
}
```

**No History Response (200):**
```json
{ "history": null }
```

### GET `/api/doctor/records/pdf/download`

Get a download URL for the generated PDF. Returns different URLs based on environment.

**Dev Response (200):**
```json
{
  "mode": "dev",
  "downloadUrl": "/api/doctor/records/pdf/file?f=dokter_1234567890_patients.pdf",
  "filename": "dokter_1234567890_patients.pdf"
}
```

**Production Response (200):**
```json
{
  "mode": "production",
  "downloadUrl": "https://storage.google.com/signed-url...",
  "filename": "dokter_1234567890_patients.pdf"
}
```

**Error Response (404):**
```json
{ "msg": "Belum ada riwayat print. Klik \"Print PDF\" dulu." }
```

### GET `/api/doctor/records/pdf/file`

Serve the raw PDF binary (dev mode only). Accepts `?token=` query param.

**Query Parameters:**
- `f` — filename (required)

**Headers:**
- `Content-Type: application/pdf`
- `Content-Disposition: inline; filename="..."`

---

## Public Endpoints

### GET `/api/public/docs`

Simple API documentation for external integrators.

**Success Response (200):**
```json
{
  "endpoint": "/api/public/predict",
  "method": "POST",
  "body": "JSON Object (age, sex, cp...)",
  "description": "Open API for external hospital integration"
}
```

### POST `/api/public/predict`

Proxy to AI Service for external hospital/RS integration. No auth required.

**Request Body:**
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

**Success Response (200):**
```json
{
  "status": "success",
  "prediction_class": 1,
  "result_text": "Risiko Tinggi",
  "probability_percent": 78.5
}
```

**Error Response (500):**
```json
{ "msg": "AI Service Error" }
```

---

## AI Service (Python)

> **Base URL**: `http://localhost:8000`
> **Framework**: FastAPI + Pydantic + scikit-learn

### POST `/predict`

Run heart disease prediction using the loaded ML model.

**Request Body:**
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

**Field Descriptions:**

| Field | Type | Description |
|---|---|---|
| `age` | float | Patient age |
| `sex` | string | `"male"` / `"female"` (or `"1"` / `"0"`) |
| `cp` | float | Chest pain type (0-3) |
| `trestbps` | float | Resting blood pressure (mmHg) |
| `chol` | float | Serum cholesterol (mg/dl) |
| `fbs` | float | Fasting blood sugar > 120 mg/dl (0/1) |
| `restecg` | float | Resting ECG results (0-2) |
| `thalach` | float | Maximum heart rate achieved |
| `exang` | float | Exercise-induced angina (0/1) |
| `oldpeak` | float | ST depression induced by exercise |
| `slope` | float | Slope of peak exercise ST segment (0-2) |
| `ca` | float | Number of major vessels (0-3) |
| `thal` | float | Thalassemia (0-3) |

**Success Response (200):**
```json
{
  "status": "success",
  "prediction_class": 1,
  "result_text": "Risiko Tinggi",
  "probability_percent": 78.5
}
```

**Response Fields:**

| Field | Type | Description |
|---|---|---|
| `status` | string | `"success"` or error detail |
| `prediction_class` | int | `0` =低风险, `1` =高风险 |
| `result_text` | string | `"Risiko Rendah"` or `"Risiko Tinggi"` |
| `probability_percent` | float | Risk percentage (0-100) |

**Error Response (500) — Model not loaded:**
```json
{ "detail": "Model not loaded" }
```

**Error Response (400) — Invalid input:**
```json
{ "detail": "error message" }
```

---

## Data Models

### Doctor
| Field | Type | Description |
|---|---|---|
| `id` | int | Primary key |
| `nip` | string | Doctor ID / license number (unique) |
| `name` | string | Doctor's full name |
| `password` | string | Password (stored plain in this version) |

### PatientRecord
| Field | Type | Description |
|---|---|---|
| `id` | int | Primary key |
| `patient_number` | string | Patient identifier |
| `patient_name` | string | Patient full name |
| `medical_data` | JSON | Raw medical parameters submitted to AI |
| `prediction_result` | string | `"Risiko Rendah"` or `"Risiko Tinggi"` |
| `probability` | float | Risk percentage (0-100) |
| `doctor_nip` | string | NIP of the responsible doctor |

### PrintHistory
| Field | Type | Description |
|---|---|---|
| `id` | int | Primary key |
| `doctor_nip` | string | NIP of the doctor |
| `filename` | string | Generated PDF filename |
| `storage_path` | string | Full path to PDF file |
| `mode` | string | `"dev"` or `"production"` |
| `last_printed_at` | datetime | Last generation timestamp |

---

## Error Codes

| HTTP Status | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad request (validation error / conflict) |
| 401 | Unauthorized (wrong credentials / invalid token) |
| 403 | Forbidden (wrong role / no token / access denied) |
| 404 | Not found (resource doesn't exist) |
| 500 | Internal server error (AI service down / model not loaded) |

---

## Security Notes

- All Admin and Doctor endpoints require a valid JWT token.
- Admin-only endpoints verify `role === 'admin'`.
- Doctor-only endpoints verify `role === 'doctor'` and filter data by the doctor's NIP.
- The Public API (`/api/public/*`) requires no authentication and proxies directly to the AI service.
- Passwords are stored in plain text — consider hashing in production.
