import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, InputGroup, Badge, Tab, Tabs } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaUserPlus, FaSearch, FaEye, FaEyeSlash, FaUserMd, FaNotesMedical, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const AdminDashboard = () => {
  // State Data
  const [doctors, setDoctors] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // State UI
  const [searchNip, setSearchNip] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [key, setKey] = useState('doctors');

  // State Form (CRUD)
  const [formData, setFormData] = useState({ nip: '', name: '', password: '' });
  const [isEdit, setIsEdit] = useState(false); // Mode edit atau tambah
  const [editId, setEditId] = useState(null);  // ID dokter yang sedang diedit

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const resDocs = await axios.get('http://localhost:3000/api/admin/doctors', { headers });
      const resRecs = await axios.get('http://localhost:3000/api/admin/all-records', { headers });
      setDoctors(resDocs.data);
      setAllRecords(resRecs.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal memuat data admin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- LOGIC CRUD DOKTER ---

  // 1. Submit Form (Bisa Create atau Update)
  const handleSubmitDoctor = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        // Mode UPDATE
        await axios.put(`http://localhost:3000/api/admin/doctors/${editId}`, formData, { headers });
        Swal.fire('Terupdate!', 'Data dokter berhasil diperbarui.', 'success');
      } else {
        // Mode CREATE
        await axios.post('http://localhost:3000/api/admin/doctors', formData, { headers });
        Swal.fire('Sukses', 'Dokter baru berhasil didaftarkan.', 'success');
      }
      
      resetForm();
      fetchData(); // Refresh tabel
    } catch (err) {
      Swal.fire('Gagal', 'Terjadi kesalahan (Cek duplikasi NIP).', 'error');
    }
  };

  // 2. Persiapan Edit (Isi form dengan data yang dipilih)
  const handleEditClick = (doc) => {
    setFormData({ nip: doc.nip, name: doc.name, password: doc.password });
    setEditId(doc.id);
    setIsEdit(true);
    // Scroll ke form di tampilan mobile (opsional)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. Hapus Dokter
  const handleDeleteClick = async (id) => {
    const result = await Swal.fire({
      title: 'Yakin hapus dokter ini?',
      text: "Akses login dokter tersebut akan hilang.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/admin/doctors/${id}`, { headers });
        Swal.fire('Terhapus!', 'Data dokter telah dihapus.', 'success');
        fetchData();
        if (isEdit && editId === id) resetForm(); // Reset form jika sedang edit user yang dihapus
      } catch (err) {
        Swal.fire('Error', 'Gagal menghapus dokter.', 'error');
      }
    }
  };

  // 4. Reset Form / Batal Edit
  const resetForm = () => {
    setFormData({ nip: '', name: '', password: '' });
    setIsEdit(false);
    setEditId(null);
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter Dokter
  const filteredDoctors = doctors.filter(doc => 
    doc.nip.toLowerCase().includes(searchNip.toLowerCase()) ||
    doc.name.toLowerCase().includes(searchNip.toLowerCase())
  );

  return (
    <Container>
      <div className="mb-4">
        <h2 className="fw-bold text-primary">Admin Control Center</h2>
        <p className="text-muted">Kelola akun dokter dan monitoring data medis global.</p>
      </div>

      <Tabs id="admin-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="mb-4 border-bottom-0">
        
        {/* TAB 1: MANAJEMEN DOKTER */}
        <Tab eventKey="doctors" title={<span className="fw-bold"><FaUserMd className="me-2"/>Manajemen Dokter</span>}>
          <Row>
            {/* KOLOM KIRI: TABEL LIST */}
            <Col md={8}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
                  <h6 className="m-0 fw-bold">Daftar Dokter ({filteredDoctors.length})</h6>
                  <InputGroup size="sm" style={{ width: '220px' }}>
                    <InputGroup.Text><FaSearch /></InputGroup.Text>
                    <Form.Control 
                      placeholder="Cari NIP / Nama..." 
                      value={searchNip}
                      onChange={(e) => setSearchNip(e.target.value)}
                    />
                  </InputGroup>
                </Card.Header>
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Info Dokter</th>
                        <th>Kredensial</th>
                        <th className="text-end pe-3">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDoctors.map((doc) => (
                        <tr key={doc.id} className={isEdit && editId === doc.id ? "table-active" : ""}>
                          <td>
                            <div className="fw-bold text-dark">{doc.name}</div>
                            <Badge bg="primary" className="fw-normal">{doc.nip}</Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <code className="bg-light border px-2 py-1 rounded text-dark">
                                {visiblePasswords[doc.id] ? doc.password : '•••••••'}
                              </code>
                              <span 
                                onClick={() => togglePasswordVisibility(doc.id)} 
                                style={{cursor: 'pointer', opacity: 0.5}}
                              >
                                {visiblePasswords[doc.id] ? <FaEyeSlash/> : <FaEye/>}
                              </span>
                            </div>
                          </td>
                          <td className="text-end pe-3">
                            <Button variant="light" size="sm" className="me-2 text-primary" onClick={() => handleEditClick(doc)}>
                              <FaEdit />
                            </Button>
                            <Button variant="light" size="sm" className="text-danger" onClick={() => handleDeleteClick(doc.id)}>
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {filteredDoctors.length === 0 && <tr><td colSpan="3" className="text-center py-4 text-muted">Tidak ada data.</td></tr>}
                    </tbody>
                  </Table>
                </div>
              </Card>
            </Col>

            {/* KOLOM KANAN: FORM INPUT/EDIT */}
            <Col md={4}>
              <Card className={`shadow-sm border-0 text-white ${isEdit ? 'bg-warning' : 'bg-primary'}`}>
                <Card.Body>
                  <Card.Title className="fw-bold mb-3 d-flex justify-content-between align-items-center">
                    <span>
                      {isEdit ? <FaEdit className="me-2"/> : <FaUserPlus className="me-2"/>}
                      {isEdit ? 'Edit Data Dokter' : 'Tambah Dokter Baru'}
                    </span>
                    {isEdit && (
                        <Button size="sm" variant="light" onClick={resetForm} title="Batal Edit"><FaTimes/></Button>
                    )}
                  </Card.Title>
                  
                  <Form onSubmit={handleSubmitDoctor}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small opacity-75">Nomor Induk (NIP)</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={formData.nip}
                        onChange={(e) => setFormData({...formData, nip: e.target.value})}
                        required 
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="small opacity-75">Nama Lengkap</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required 
                      />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="small opacity-75">Password Akun</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required 
                      />
                    </Form.Group>

                    <div className="d-grid gap-2">
                        <Button variant="light" type="submit" className={`fw-bold ${isEdit ? 'text-warning' : 'text-primary'}`}>
                        {isEdit ? <><FaSave className="me-1"/> Simpan Perubahan</> : <><FaUserPlus className="me-1"/> Daftarkan Dokter</>}
                        </Button>
                        {isEdit && (
                             <Button variant="outline-light" size="sm" onClick={resetForm}>Batal</Button>
                        )}
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* TAB 2: MONITORING PASIEN (Sama seperti sebelumnya) */}
        <Tab eventKey="records" title={<span className="fw-bold"><FaNotesMedical className="me-2"/>Monitoring Pasien</span>}>
          <Card className="shadow-sm border-0">
             <Card.Header className="bg-white py-3">
                <h6 className="m-0 fw-bold">Log Aktivitas Medis (Read-Only)</h6>
             </Card.Header>
             <Table hover responsive className="mb-0 align-middle">
               <thead className="bg-light">
                 <tr>
                   <th>No. Pasien</th>
                   <th>Nama Pasien</th>
                   <th>Dokter PJ</th>
                   <th>Hasil Prediksi</th>
                   <th>Probabilitas</th>
                   <th>Waktu</th>
                 </tr>
               </thead>
               <tbody>
                 {allRecords.map((rec) => (
                   <tr key={rec.id}>
                     <td>{rec.patient_number}</td>
                     <td className="fw-bold">{rec.patient_name}</td>
                     <td><Badge bg="secondary" className="fw-normal">{rec.doctor_nip}</Badge></td>
                     <td>
                        <Badge bg={rec.prediction_result.includes('Tinggi') ? 'danger' : 'success'} pill>
                          {rec.prediction_result}
                        </Badge>
                     </td>
                     <td>{rec.probability ? rec.probability.toFixed(1) + '%' : '-'}</td>
                     <td className="small text-muted">{new Date(rec.updatedAt).toLocaleString()}</td>
                   </tr>
                 ))}
                 {allRecords.length === 0 && <tr><td colSpan="6" className="text-center py-4 text-muted">Belum ada data.</td></tr>}
               </tbody>
             </Table>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminDashboard;