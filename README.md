<div align="center">

  <h1>🛠️ Installation & Setup Guide</h1>
  
  <p>
    <b>Panduan Lengkap Deployment Sistem CardioSentries (Localhost)</b>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Database-MySQL-orange?style=for-the-badge&logo=mysql" />
    <img src="https://img.shields.io/badge/AI_Engine-Python_FastAPI-yellow?style=for-the-badge&logo=python" />
    <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=nodedotjs" />
    <img src="https://img.shields.io/badge/Frontend-React.js-blue?style=for-the-badge&logo=react" />
  </p>
  
  <br />
</div>

---

### 📋 Prerequisites

Pastikan perangkat Anda sudah terinstall:
* **[Node.js](https://nodejs.org/)** (v16+)
* **[Python](https://www.python.org/)** (v3.8+)
* **[XAMPP](https://www.apachefriends.org/)** (Apache & MySQL)
* **[Git](https://git-scm.com/)**

---

# 1️⃣ Database Setup (MySQL)

Buat database baru dengan nama: `cardio_db`
  > ⚠️ **Note:** *Jangan buat tabel manual. Backend akan otomatis membuatnya.*

---

# 2️⃣ AI Service Setup (Python)

Buka terminal, masuk ke folder `ai-service`, lalu jalankan:

## 1. Install Library
```bash
pip install fastapi uvicorn scikit-learn pandas numpy joblib
```

## 2. Jalankan Server (Port 8000)
```bash
uvicorn main:app --port 8000 --reload
```
✅ Biarkan terminal ini terbuka. Pesan sukses: Application startup complete.

# 3️⃣ Backend Setup (Node.js)
Buka Terminal BARU, masuk ke folder backend-service.

## 1. Sesuaikan DATABASE CONFIG di .env

## 2. Install Library
```bash
npm install
```

## 3. Jalankan Server (Port 3000)
```bash
node server.js
```
✅ Biarkan terminal ini terbuka. Pesan sukses: Connected to MySQL Database.

# 4️⃣ Frontend Setup (React)
Buka Terminal BARU, masuk ke folder frontend-client, lalu jalankan:

## 1. Install Library
```bash
npm install
```

## 2. Jalankan Aplikasi
```bash
npm run dev
```
🚀 Selesai! Buka browser Anda di: http://localhost:5173
