const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Setup MySQL Connection
const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASS, 
    {
        host: process.env.DB_HOST,
        dialect: 'mysql', // GANTI DARI SQLITE KE MYSQL
        logging: false,    // Set true kalau mau liat raw query SQL di terminal
        timezone: '+07:00' // Set WIB
    }
);

// Cek Koneksi
sequelize.authenticate()
    .then(() => console.log('✅ Connected to MySQL Database (XAMPP).'))
    .catch(err => console.error('❌ Unable to connect to MySQL:', err));

// --- Definisi Model (Sama seperti sebelumnya) ---

// Model Dokter
const Doctor = sequelize.define('Doctor', {
    nip: { type: DataTypes.STRING, unique: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false } 
});

// Model Record Pasien
const PatientRecord = sequelize.define('PatientRecord', {
    patient_number: { type: DataTypes.STRING, allowNull: false },
    patient_name: { type: DataTypes.STRING, allowNull: false },
    medical_data: { type: DataTypes.JSON, allowNull: false },
    prediction_result: { type: DataTypes.STRING },
    probability: { type: DataTypes.FLOAT },
    doctor_nip: { type: DataTypes.STRING }
});

// Relasi (Opsional tapi bagus): Record milik Dokter
Doctor.hasMany(PatientRecord, { foreignKey: 'doctor_nip', sourceKey: 'nip' });
PatientRecord.belongsTo(Doctor, { foreignKey: 'doctor_nip', targetKey: 'nip' });

// Sinkronisasi: Pakai { alter: true } agar kalau ada perubahan kolom, tabel di MySQL menyesuaikan
sequelize.sync({ alter: true })
    .then(() => console.log("✅ MySQL Tables Synced!"))
    .catch(err => console.log("❌ Sync Error:", err));

module.exports = { sequelize, Doctor, PatientRecord };