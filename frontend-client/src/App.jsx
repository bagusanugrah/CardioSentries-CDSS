import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import LandingPage from './pages/LandingPage';
import Navigation from './components/Navigation';

// 1. PrivateRoute: Mencegah Tamu masuk ke Dashboard
const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/" replace />;
  
  return children;
};

// 2. NEW: GuestRoute: Mencegah Orang yang sudah Login masuk ke halaman Login lagi
const GuestRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token) {
    // Kalau sudah login, langsung lempar ke dashboard masing-masing
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'doctor') return <Navigate to="/doctor" replace />;
  }

  // Kalau belum login, boleh akses halaman ini (Login/Landing)
  return children;
};

function App() {
  return (
    <Router>
      <Navigation />
      <div className="container py-4">
        <Routes>
          {/* Public Route (Bisa diakses siapa saja, termasuk yang sudah login) */}
          <Route path="/" element={<LandingPage />} />

          {/* GUEST ONLY Route (Hanya untuk yang BELUM login) */}
          <Route path="/login" element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } />

          {/* PROTECTED Route (Hanya untuk Admin) */}
          <Route path="/admin" element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          } />

          {/* PROTECTED Route (Hanya untuk Dokter) */}
          <Route path="/doctor" element={
            <PrivateRoute role="doctor">
              <DoctorDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;