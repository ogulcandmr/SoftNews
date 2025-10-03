import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {MDBContainer, MDBCol, MDBRow, MDBBtn, MDBIcon, MDBInput, MDBCheckbox } from 'mdb-react-ui-kit';
import ToastMessage from '../components/ToastMessage';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Kayıtlı kullanıcıyı localStorage'dan kontrol et
    const registered = JSON.parse(localStorage.getItem('softnews_registered'));
    if (registered && email === registered.email && password === registered.password) {
      localStorage.setItem('softnews_user', JSON.stringify({ email }));
      window.dispatchEvent(new Event('softnews_user_change'));
      setError('');
      setToast({ message: 'Başarıyla giriş yapıldı!', type: 'success' });
      setTimeout(() => navigate('/'), 1200);
    } else if (email === 'ogulcandmr96@gmail.com' && password === '1714Olci.') {
      localStorage.setItem('softnews_user', JSON.stringify({ email }));
      window.dispatchEvent(new Event('softnews_user_change'));
      setError('');
      setToast({ message: 'Başarıyla giriş yapıldı!', type: 'success' });
      setTimeout(() => navigate('/'), 1200);
    } else {
      setError('Geçersiz e-posta veya şifre!');
      setToast({ message: 'Geçersiz e-posta veya şifre!', type: 'error' });
    }
  };

  return (
    <MDBContainer fluid className="p-3 my-5 h-custom">
      <MDBRow>
        <MDBCol col='10' md='6'>
          <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp" className="img-fluid" alt="Sample image" />
        </MDBCol>
        <MDBCol col='4' md='6'>
          <form onSubmit={handleLogin}>
          <div className="d-flex flex-row align-items-center justify-content-center">
            <p className="lead fw-normal mb-0 me-3">Sign in with</p>
            <MDBBtn floating size='md' tag='a' className='me-2'>
              <MDBIcon fab icon='facebook-f' />
            </MDBBtn>
            <MDBBtn floating size='md' tag='a'  className='me-2'>
              <MDBIcon fab icon='twitter' />
            </MDBBtn>
            <MDBBtn floating size='md' tag='a'  className='me-2'>
              <MDBIcon fab icon='linkedin-in' />
            </MDBBtn>
          </div>
          <div className="divider d-flex align-items-center my-4">
            <p className="text-center fw-bold mx-3 mb-0">Or</p>
          </div>
            <MDBInput wrapperClass='mb-4' label='Email address' id='formControlLg' type='email' size="lg" value={email} onChange={e => setEmail(e.target.value)} required/>
            <MDBInput wrapperClass='mb-4' label='Password' id='formControlLg' type='password' size="lg" value={password} onChange={e => setPassword(e.target.value)} required/>
          <div className="d-flex justify-content-between mb-4">
            <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Remember me' />
            <a href="!#">Forgot password?</a>
          </div>
            {error && <div className="text-danger mb-3">{error}</div>}
          <div className='text-center text-md-start mt-4 pt-2'>
              <MDBBtn className="mb-0 px-5" size='lg' type="submit">Login</MDBBtn>
              <p className="small fw-bold mt-2 pt-1 mb-2">Don't have an account? <a href="/RegisterPage" className="link-danger">Register</a></p>
          </div>
          </form>
        </MDBCol>
      </MDBRow>
      <div className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-primary">
        <div className="text-white mb-3 mb-md-0">
          
        </div>
        <div>
          <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
            <MDBIcon fab icon='facebook-f' size="md"/>
          </MDBBtn>
          <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white'  }}>
            <MDBIcon fab icon='twitter' size="md"/>
          </MDBBtn>
          <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white'  }}>
            <MDBIcon fab icon='google' size="md"/>
          </MDBBtn>
          <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white'  }}>
            <MDBIcon fab icon='linkedin-in' size="md"/>
          </MDBBtn>
        </div>
      </div>
      {toast && <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </MDBContainer>
  );
}

export default LoginPage;