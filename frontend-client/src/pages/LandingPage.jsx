import { Container, Button, Card, Row, Col } from 'react-bootstrap';
import { FaHeartbeat, FaNetworkWired, FaUserShield } from 'react-icons/fa'; // Ganti icon biar lebih relevan
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-5">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">CardioSentries <span className="text-dark">Enterprise</span></h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '750px' }}>
          Sistem Pendukung Keputusan Klinis (CDSS) Terintegrasi untuk Unit Kardiologi.
          Meningkatkan akurasi diagnosis dini dan efisiensi operasional rumah sakit.
        </p>
        <div className="d-flex justify-content-center gap-3 mt-4">
            <Button size="lg" className="px-5" onClick={() => navigate('/login')}>
               Akses Portal Staff
            </Button>
            <Button variant="outline-secondary" size="lg" href="#api-docs">
               Integrasi Sistem (IT)
            </Button>
        </div>
      </div>

      {/* Features Grid - VERSI BAHASA INDUSTRI (Bukan Bahasa Kuliah) */}
      <Row id="features" className="g-4 mb-5" style={{ scrollMarginTop: '90px' }}>
        <Col md={4}>
            <Card className="h-100 p-4 text-center border-0 shadow-sm">
                <div className="text-primary mb-3"><FaHeartbeat size={40}/></div>
                <h5 className="fw-bold">Clinical Decision Support</h5>
                <p className="text-muted small">
                  Algoritma prediktif tervalidasi untuk membantu tenaga medis menentukan stratifikasi risiko pasien secara <i>real-time</i> dan akurat.
                </p>
            </Card>
        </Col>
        <Col md={4}>
            <Card className="h-100 p-4 text-center border-0 shadow-sm">
                <div className="text-primary mb-3"><FaNetworkWired size={40}/></div>
                <h5 className="fw-bold">Hospital Interoperability</h5>
                <p className="text-muted small">
                  Arsitektur API terbuka yang siap dihubungkan dengan SIMRS, EMR, dan sistem asuransi nasional untuk pertukaran data yang mulus.
                </p>
            </Card>
        </Col>
        <Col md={4}>
            <Card className="h-100 p-4 text-center border-0 shadow-sm">
                <div className="text-primary mb-3"><FaUserShield size={40}/></div>
                <h5 className="fw-bold">Data Privacy & Compliance</h5>
                <p className="text-muted small">
                  Protokol keamanan berlapis dengan manajemen akses berbasis peran (RBAC) untuk menjamin kerahasiaan rekam medis pasien.
                </p>
            </Card>
        </Col>
      </Row>

      {/* API Documentation Section */}
      <div id="api-docs" className="bg-white p-5 rounded-4 shadow-sm border mt-5" style={{ scrollMarginTop: '90px' }}>
        <div className="d-flex align-items-center gap-3 mb-4">
            <div className="bg-dark text-white p-2 rounded"><FaNetworkWired size={24}/></div>
            <h3 className="mb-0">Developer & Integration Hub</h3>
        </div>
        <p className="text-muted">
            Gunakan endpoint standar berikut untuk menghubungkan sistem Electronic Health Record (EHR) eksternal dengan engine prediksi CardioSentries.
        </p>
        
        <div className="bg-light p-4 rounded border font-monospace">
            <div className="mb-3">
                <span className="badge bg-success me-2 px-3 py-2">POST</span> 
                <strong className="text-dark">/api/public/predict</strong>
            </div>
            <div className="text-muted mb-2 small">// Request Body Example (JSON)</div>
            <pre className="mb-0 text-dark" style={{ fontSize: '0.85em' }}>
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
        <div className="alert alert-info mt-3 d-flex align-items-center" role="alert">
            <small>
                <strong>Catatan Teknis:</strong> Endpoint ini dirancang <i>stateless</i> untuk performa tinggi dan kompatibel dengan format pertukaran data kesehatan modern.
            </small>
        </div>
      </div>
      
      {/* Footer ala-ala Corporate */}
      <div className="text-center mt-5 pt-5 pb-3 text-muted small">
        <p>&copy; 2025 CardioSentries Health Solutions. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default LandingPage;