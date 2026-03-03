import { useState } from 'react';
import { Card, Form, Button, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUserMd } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
      
      // Simpan sesi
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('userName', res.data.user.name);
      localStorage.setItem('userNip', res.data.user.nip || '');

      // Redirect sesuai role
      if (res.data.role === 'admin') navigate('/admin');
      else navigate('/doctor');

    } catch (err) {
      setError('Username atau Password salah!');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: '400px' }} className="p-4 shadow-lg">
        <div className="text-center mb-4">
          <div className="bg-primary text-white rounded-circle d-inline-flex p-3 mb-3">
            <FaUserMd size={32} />
          </div>
          <h4 className="fw-bold">Login Portal</h4>
          <p className="text-muted small">Masuk untuk akses sistem klinis</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Username / NIP</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Masukkan ID" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100 py-2">
            Masuk Sistem
          </Button>
        </Form>
        <div className="text-center mt-3">
           <a href="/" className="text-decoration-none small">← Kembali ke Beranda</a>
        </div>
      </Card>
    </Container>
  );
};

export default Login;