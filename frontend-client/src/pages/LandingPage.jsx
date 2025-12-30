import { Container, Button, Card, Row, Col } from 'react-bootstrap';
import { FaCode, FaHospitalUser, FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-5">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">CardioSentries CDSS</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
          Sistem Pendukung Keputusan Klinis berbasis AI untuk deteksi dini risiko penyakit jantung.
          Terintegrasi, Aman, dan Interoperable.
        </p>
        <div className="d-flex justify-content-center gap-3 mt-4">
            <Button size="lg" onClick={() => navigate('/login')}>Login Staff Medis</Button>
            <Button variant="outline-secondary" size="lg" href="#api-docs">Dokumentasi API</Button>
        </div>
      </div>

      {/* Features Grid */}
      <Row className="g-4 mb-5">
        <Col md={4}>
            <Card className="h-100 p-4 text-center">
                <div className="text-primary mb-3"><FaHospitalUser size={40}/></div>
                <h5>AI-Powered Analysis</h5>
                <p className="text-muted small">Menggunakan Logistic Regression dengan akurasi tinggi untuk membantu diagnosa dokter.</p>
            </Card>
        </Col>
        <Col md={4}>
            <Card className="h-100 p-4 text-center">
                <div className="text-primary mb-3"><FaCode size={40}/></div>
                <h5>Interoperable API</h5>
                <p className="text-muted small">Mendukung integrasi JSON REST API (Module 10) untuk sistem rumah sakit eksternal.</p>
            </Card>
        </Col>
        <Col md={4}>
            <Card className="h-100 p-4 text-center">
                <div className="text-primary mb-3"><FaShieldAlt size={40}/></div>
                <h5>Secure & Governed</h5>
                <p className="text-muted small">Role-Based Access Control (Module 11) menjamin keamanan data pasien.</p>
            </Card>
        </Col>
      </Row>

      {/* API Documentation Section (Penting untuk Nilai EAS) */}
      <div id="api-docs" className="bg-white p-5 rounded-4 shadow-sm border">
        <div className="d-flex align-items-center gap-3 mb-4">
            <div className="bg-dark text-white p-2 rounded"><FaCode size={24}/></div>
            <h3 className="mb-0">Dokumentasi API Publik</h3>
        </div>
        <p>Gunakan endpoint ini untuk integrasi dengan sistem eksternal (SIMRS).</p>
        
        <div className="bg-light p-3 rounded border font-monospace">
            <div className="mb-2">
                <span className="badge bg-success me-2">POST</span> 
                <strong>http://localhost:3000/api/public/predict</strong>
            </div>
            <pre className="mb-0 text-muted" style={{ fontSize: '0.9em' }}>
{`{
  "age": 55,
  "sex": "1",
  "cp": 0,
  "trestbps": 140,
  "chol": 220,
  "fbs": 0,
  "restecg": 1,
  "thalach": 150,
  "exang": 1,
  "oldpeak": 2.5,
  "slope": 2,
  "ca": 0,
  "thal": 2
}`}
            </pre>
        </div>
        <p className="mt-3 small text-muted">
            *Respon akan berupa JSON berisi prediksi kelas (0/1) dan persentase probabilitas.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;