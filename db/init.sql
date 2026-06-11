CREATE DATABASE IF NOT EXISTS cardio_db;
USE cardio_db;

CREATE TABLE IF NOT EXISTS Doctors (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    nip VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS PatientRecords (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    patient_number VARCHAR(50),
    patient_name VARCHAR(255),
    medical_data TEXT,
    prediction_result VARCHAR(100),
    probability DECIMAL(5,2),
    doctor_nip VARCHAR(50),
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS PrintHistories (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    doctor_nip VARCHAR(50) UNIQUE NOT NULL,
    filename VARCHAR(255),
    storage_path TEXT,
    mode VARCHAR(20),
    last_printed_at DATETIME,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);
