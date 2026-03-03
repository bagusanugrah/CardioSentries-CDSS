import { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DoctorDashboard = () => {
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // State Form Input (Sesuai parameter API)
  const [formData, setFormData] = useState({
    patient_number: '', patient_name: '',
    age: '', sex: '1', cp: '0', trestbps: '', chol: '',
    fbs: '0', restecg: '0', thalach: '', exang: '0',
    oldpeak: '', slope: '0', ca: '0', thal: '0'
  });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch Data Pasien
  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/doctor/records`, { headers });
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Submit (Prediksi & Simpan)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowModal(false);
    
    // Tampilkan Loading Swal
    Swal.fire({
      title: 'Menganalisis...',
      text: 'AI sedang memproses data jantung pasien',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    // Siapkan Payload Data Medis
    const medical_data = {
      age: parseFloat(formData.age),
      sex: formData.sex, // String '1'/'0' handled by backend
      cp: parseFloat(formData.cp),
      trestbps: parseFloat(formData.trestbps),
      chol: parseFloat(formData.chol),
      fbs: parseFloat(formData.fbs),
      restecg: parseFloat(formData.restecg),
      thalach: parseFloat(formData.thalach),
      exang: parseFloat(formData.exang),
      oldpeak: parseFloat(formData.oldpeak),
      slope: parseFloat(formData.slope),
      ca: parseFloat(formData.ca),
      thal: parseFloat(formData.thal)
    };

    const payload = {
      patient_number: formData.patient_number,
      patient_name: formData.patient_name,
      medical_data: medical_data
    };

    try {
      let res;
      if (isEdit) {
        // Mode Edit
        res = await axios.put(`${API_BASE_URL}/api/doctor/records/${editId}`, { medical_data }, { headers });
      } else {
        // Mode Baru
        res = await axios.post(`${API_BASE_URL}/api/doctor/predict`, payload, { headers });
      }

      const result = res.data.data.prediction_result;
      
      // Tampilkan Hasil
      Swal.fire({
        icon: result.includes('Tinggi') ? 'warning' : 'success',
        title: 'Analisis Selesai',
        text: `Hasil Prediksi: ${result}`,
      });

      fetchRecords(); // Refresh Tabel
      resetForm();

    } catch (err) {
      Swal.fire('Error', 'Gagal memproses data', 'error');
    }
  };

  // Helper Reset Form
  const resetForm = () => {
    setFormData({
        patient_number: '', patient_name: '', age: '', sex: '1', cp: '0', trestbps: '', chol: '',
        fbs: '0', restecg: '0', thalach: '', exang: '0', oldpeak: '', slope: '0', ca: '0', thal: '0'
    });
    setIsEdit(false);
  };

  // Helper Buka Modal Edit
  const handleEdit = (rec) => {
    // Parse data medis dari JSON DB
    const med = typeof rec.medical_data === 'string' ? JSON.parse(rec.medical_data) : rec.medical_data;
    setFormData({
        patient_number: rec.patient_number,
        patient_name: rec.patient_name,
        ...med
    });
    setEditId(rec.id);
    setIsEdit(true);
    setShowModal(true);
  };

  // Helper Hapus
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Hapus data pasien?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus'
    });

    if (confirm.isConfirmed) {
      await axios.delete(`${API_BASE_URL}/api/doctor/records/${id}`, { headers });
      fetchRecords();
      Swal.fire('Terhapus!', '', 'success');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Dashboard Klinis</h2>
          <p className="text-muted">Kelola data pasien dan lakukan prediksi risiko jantung.</p>
        </div>
        <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <FaPlus className="me-2" /> Pasien Baru
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th className="p-3">No. Pasien</th>
              <th>Nama Pasien</th>
              <th>Tgl Periksa</th>
              <th>Hasil Prediksi</th>
              <th>Probabilitas</th>
              <th className="text-end pe-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.id}>
                <td className="p-3 fw-bold">{rec.patient_number}</td>
                <td>{rec.patient_name}</td>
                <td className="small text-muted">{new Date(rec.updatedAt).toLocaleDateString()}</td>
                <td>
                  <Badge bg={rec.prediction_result.includes('Tinggi') ? 'danger' : 'success'} pill className="px-3 py-2">
                    {rec.prediction_result}
                  </Badge>
                </td>
                <td>{rec.probability ? rec.probability.toFixed(1) + '%' : '-'}</td>
                <td className="text-end pe-4">
                  <Button variant="light" size="sm" className="me-2 text-primary" onClick={() => handleEdit(rec)}>
                    <FaEdit />
                  </Button>
                  <Button variant="light" size="sm" className="text-danger" onClick={() => handleDelete(rec.id)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
                <tr><td colSpan="6" className="text-center py-5 text-muted">Belum ada data pasien.</td></tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* --- MODAL FORM PREDIKSI (Sangat Penting) --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Update Kondisi Klinis' : 'Input Pasien Baru'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Data Identitas (Readonly jika edit) */}
            <h6 className="fw-bold text-primary mb-3">Identitas Pasien</h6>
            <Row className="mb-3">
                <Col>
                    <Form.Control placeholder="Nomor Pasien" name="patient_number" value={formData.patient_number} onChange={handleChange} disabled={isEdit} required />
                </Col>
                <Col>
                    <Form.Control placeholder="Nama Lengkap" name="patient_name" value={formData.patient_name} onChange={handleChange} disabled={isEdit} required />
                </Col>
            </Row>

            <hr />
            <h6 className="fw-bold text-primary mb-3">Parameter Klinis (Auto AI Analysis)</h6>
            
            {/* Baris 1 */}
            <Row className="mb-2">
                <Col md={3}><Form.Label className="small">Umur</Form.Label><Form.Control type="number" name="age" value={formData.age} onChange={handleChange} required /></Col>
                <Col md={3}>
                    <Form.Label className="small">Gender</Form.Label>
                    <Form.Select name="sex" value={formData.sex} onChange={handleChange}>
                        <option value="1">Laki-laki</option>
                        <option value="0">Perempuan</option>
                    </Form.Select>
                </Col>
                <Col md={3}><Form.Label className="small">Tekanan Darah (trestbps)</Form.Label><Form.Control type="number" name="trestbps" value={formData.trestbps} onChange={handleChange} required /></Col>
                <Col md={3}><Form.Label className="small">Kolesterol (chol)</Form.Label><Form.Control type="number" name="chol" value={formData.chol} onChange={handleChange} required /></Col>
            </Row>

            {/* Baris 2 */}
            <Row className="mb-2">
                <Col md={3}><Form.Label className="small">Detak Jantung (thalach)</Form.Label><Form.Control type="number" name="thalach" value={formData.thalach} onChange={handleChange} required /></Col>
                <Col md={3}>
                    <Form.Label className="small">Nyeri Dada (cp)</Form.Label>
                    <Form.Select name="cp" value={formData.cp} onChange={handleChange}>
                        <option value="0">Typical Angina</option>
                        <option value="1">Atypical Angina</option>
                        <option value="2">Non-anginal</option>
                        <option value="3">Asymptomatic</option>
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <Form.Label className="small">Gula Darah &gt; 120 (fbs)</Form.Label>
                    <Form.Select name="fbs" value={formData.fbs} onChange={handleChange}>
                        <option value="0">Tidak</option>
                        <option value="1">Ya</option>
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <Form.Label className="small">ECG (restecg)</Form.Label>
                    <Form.Select name="restecg" value={formData.restecg} onChange={handleChange}>
                        <option value="0">Normal</option>
                        <option value="1">ST-T Abnormality</option>
                        <option value="2">LV Hypertrophy</option>
                    </Form.Select>
                </Col>
            </Row>

            {/* Baris 3 - Sisanya (exang, oldpeak, slope, ca, thal) */}
            <Row className="mb-2">
                 <Col md={3}>
                    <Form.Label className="small">Angina Latihan (exang)</Form.Label>
                    <Form.Select name="exang" value={formData.exang} onChange={handleChange}>
                        <option value="0">Tidak</option>
                        <option value="1">Ya</option>
                    </Form.Select>
                </Col>
                <Col md={3}><Form.Label className="small">Oldpeak</Form.Label><Form.Control type="number" step="0.1" name="oldpeak" value={formData.oldpeak} onChange={handleChange} required /></Col>
                <Col md={3}>
                     <Form.Label className="small">Slope</Form.Label>
                     <Form.Select name="slope" value={formData.slope} onChange={handleChange}>
                        <option value="0">Upsloping</option>
                        <option value="1">Flat</option>
                        <option value="2">Downsloping</option>
                    </Form.Select>
                </Col>
                <Col md={3}><Form.Label className="small">Jml Pembuluh (ca)</Form.Label><Form.Control type="number" name="ca" value={formData.ca} onChange={handleChange} required /></Col>
            </Row>

             <Row>
                <Col md={12}>
                    <Form.Label className="small">Thalassemia</Form.Label>
                    <Form.Select name="thal" value={formData.thal} onChange={handleChange}>
                        <option value="0">Normal</option>
                        <option value="1">Fixed Defect</option>
                        <option value="2">Reversable Defect</option>
                    </Form.Select>
                </Col>
             </Row>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
            <Button variant="primary" type="submit">
                {isEdit ? 'Analisis Ulang & Simpan' : 'Analisis & Simpan'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default DoctorDashboard;