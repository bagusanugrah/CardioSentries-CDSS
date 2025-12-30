import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHeartbeat, FaSignOutAlt } from 'react-icons/fa';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Jangan tampilkan navbar di halaman login biar bersih
  if (location.pathname === '/login') return null;

  return (
    <Navbar bg="white" expand="lg" className="py-3 sticky-top">
      <Container>
        <Navbar.Brand href="/" className="fw-bold text-primary d-flex align-items-center gap-2">
          <FaHeartbeat size={28} /> CardioSentries
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            
            {/* Menu Kalau Belum Login */}
            {!token && (
              <>
                <Nav.Link href="#features">Fitur</Nav.Link>
                <Nav.Link href="#api-docs">API Public</Nav.Link>
                <Button variant="primary" className="ms-2 px-4" onClick={() => navigate('/login')}>
                  Login Staff
                </Button>
              </>
            )}

            {/* Menu Kalau Sudah Login */}
            {token && (
              <>
                <span className="me-3 text-muted">Halo, <b>{userName}</b> ({role})</span>
                <Button variant="outline-danger" size="sm" onClick={handleLogout} className="d-flex align-items-center gap-2">
                  <FaSignOutAlt /> Logout
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;