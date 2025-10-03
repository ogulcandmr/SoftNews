import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MDBContainer, MDBCol, MDBRow, MDBBtn, MDBInput } from 'mdb-react-ui-kit';
import ToastMessage from '../components/ToastMessage';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      setToast({ message: 'Lütfen tüm alanları doldurun.', type: 'error' });
      return;
    }
    // Basit kayıt: localStorage'a kullanıcıyı kaydet
    localStorage.setItem('softnews_registered', JSON.stringify({ email, password }));
    setError('');
    setToast({ message: 'Kayıt başarılı! Giriş yapabilirsiniz.', type: 'success' });
    setTimeout(() => navigate('/LoginPage'), 1200);
  };

  return (
    <MDBContainer fluid className="p-3 my-5 h-custom">
      <MDBRow className="justify-content-center">
        <MDBCol md='6'>
          <form onSubmit={handleRegister}>
            <h3 className="mb-4">Kayıt Ol</h3>
            <MDBInput wrapperClass='mb-4' label='Email address' type='email' size="lg" value={email} onChange={e => setEmail(e.target.value)} required/>
            <MDBInput wrapperClass='mb-4' label='Password' type='password' size="lg" value={password} onChange={e => setPassword(e.target.value)} required/>
            {error && <div className="text-danger mb-3">{error}</div>}
            <MDBBtn className="mb-0 px-5" size='lg' type="submit">Kayıt Ol</MDBBtn>
            <p className="small fw-bold mt-2 pt-1 mb-2">Zaten hesabın var mı? <a href="/LoginPage" className="link-primary">Giriş Yap</a></p>
          </form>
        </MDBCol>
      </MDBRow>
      {toast && <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </MDBContainer>
  );
}

export default RegisterPage; 