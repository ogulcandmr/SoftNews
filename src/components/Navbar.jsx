import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Image from 'react-bootstrap/Image';
import { useNavigate } from 'react-router-dom';  // React Router v6

function CustomNavbar() {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/LoginPage'); // Giriş sayfasına yönlendir
  };

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary mb-3">
        <Container fluid>
          <Navbar.Brand href="#">SoftNews</Navbar.Brand>
          <Navbar.Toggle aria-controls="offcanvasNavbar" />
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel">Offcanvas</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3">
                <Nav.Link href="#action1">AnaSayfa</Nav.Link>
                <Nav.Link href="#action2">Son Haberler</Nav.Link>
                <NavDropdown title="Kategoriler" id="offcanvasNavbarDropdown">
                  <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
                  <NavDropdown.Item href="#action4">Another action</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action5">Something else here</NavDropdown.Item>
                </NavDropdown>
              </Nav>
              <Form className="d-flex me-3">
                <Form.Control
                  type="search"
                  placeholder="Ara"
                  className="me-2"
                  aria-label="Ara"
                />
                <Button variant="outline-success">Ara</Button>
              </Form>
              {/* Profil ikonu sağa hizalanmış */}
              <Nav className="d-flex align-items-center">
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  roundedCircle
                  width={35}
                  height={35}
                  alt="Profil"
                  style={{ cursor: 'pointer' }}
                  onClick={handleProfileClick}
                  title="Giriş yap"
                />
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </>
  );
}

export default CustomNavbar;