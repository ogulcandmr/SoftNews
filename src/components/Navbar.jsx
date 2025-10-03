import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Image from 'react-bootstrap/Image';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function CustomNavbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('softnews_user');
    setUser(stored ? JSON.parse(stored) : null);
    const handleStorage = () => {
      const updated = localStorage.getItem('softnews_user');
      setUser(updated ? JSON.parse(updated) : null);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('softnews_user_change', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('softnews_user_change', handleStorage);
    };
  }, []);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('softnews_user');
    setUser(null);
    navigate('/');
  };

  return (
    <Navbar
      expand="lg"
      className="mb-3 shadow-lg"
      style={{
        zIndex: 1050,
        position: 'relative',
        background: 'linear-gradient(90deg, #e0e7ff 0%, #f8fafc 40%, #c7d0dc 100%)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e0e7ef',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background:
            "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80') center/cover no-repeat",
          opacity: 0.13,
          pointerEvents: 'none',
        }}
      />
      <Container fluid style={{ position: 'relative', zIndex: 1 }}>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary d-flex align-items-center" style={{ fontSize: 18, padding: '0 8px', minWidth: 0 }}>
          <span role="img" aria-label="logo" style={{ fontSize: 22, marginRight: 6 }}>📰</span> SoftNews
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="offcanvasNavbar" style={{ background: '#e0e7ef', border: 'none' }} />
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="end"
          style={{ background: 'linear-gradient(90deg, #e0e7ff 0%, #f8fafc 40%, #c7d0dc 100%)' }}
          >
            <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasNavbarLabel">Menü</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3 gap-2">
              <Nav.Link as={Link} to="/">AnaSayfa</Nav.Link>
              <Nav.Link as={Link} to="/news">Son Haberler</Nav.Link>
              <Nav.Link as={Link} to="/videos">Videolar</Nav.Link>
              <Nav.Link as={Link} to="/forum">Forum</Nav.Link>
              <Nav.Link as={Link} to="/about">Hakkında</Nav.Link>
              {user && <Nav.Link as={Link} to="/profile">Profilim</Nav.Link>}
              </Nav>
            <div className="d-flex align-items-center gap-3 mt-4 mt-lg-0 justify-content-end">
              {user ? (
                <>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  roundedCircle
                  width={35}
                  height={35}
                  alt="Profil"
                    style={{ cursor: 'pointer', border: '2px solid #a5b4fc', background: '#fff' }}
                  onClick={handleProfileClick}
                    title="Profilim"
                  />
                  <Button variant="outline-danger" size="sm" onClick={handleLogout} className="ms-2">Çıkış</Button>
                </>
              ) : (
                <Button variant="outline-primary" size="sm" onClick={() => navigate('/LoginPage')}>Giriş Yap</Button>
              )}
            </div>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
  );
}

export default CustomNavbar;