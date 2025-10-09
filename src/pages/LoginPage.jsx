import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {MDBContainer, MDBCol, MDBRow, MDBBtn, MDBIcon, MDBInput, MDBCheckbox } from 'mdb-react-ui-kit';
import ToastMessage from '../components/ToastMessage';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import socialAuthService from '../services/socialAuthService';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get return URL from location state
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // Clear any previous errors
    clearError();
  }, [clearError]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    try {
      const response = await login(email, password);
      if (response.success) {
        setToast({ message: 'Başarıyla giriş yapıldı!', type: 'success' });
        setTimeout(() => navigate(from, { replace: true }), 1200);
      }
    } catch (error) {
      setToast({ message: error.message || 'Giriş yapılamadı!', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      const response = await socialAuthService.signInWithGoogle();
      if (response.success) {
        setToast({ message: 'Google ile başarıyla giriş yapıldı!', type: 'success' });
        setTimeout(() => navigate(from, { replace: true }), 1200);
      }
    } catch (error) {
      setToast({ message: error.message || 'Google ile giriş yapılamadı!', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      await socialAuthService.signInWithGitHub();
    } catch (error) {
      setToast({ message: error.message || 'GitHub ile giriş yapılamadı!', type: 'error' });
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
            <p className="lead fw-normal mb-0 me-3">Sosyal medya ile giriş yap</p>
            <MDBBtn 
              floating 
              size='md' 
              className='me-2' 
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              style={{ backgroundColor: '#db4437', borderColor: '#db4437' }}
            >
              <MDBIcon fab icon='google' />
            </MDBBtn>
            <MDBBtn 
              floating 
              size='md' 
              className='me-2' 
              onClick={handleGitHubSignIn}
              disabled={isSubmitting}
              style={{ backgroundColor: '#333', borderColor: '#333' }}
            >
              <MDBIcon fab icon='github' />
            </MDBBtn>
          </div>
          <div className="divider d-flex align-items-center my-4">
            <p className="text-center fw-bold mx-3 mb-0">Or</p>
          </div>
            <MDBInput 
              wrapperClass='mb-4' 
              label='Email address' 
              id='formControlLg' 
              type='email' 
              size="lg" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
              disabled={isSubmitting}
            />
            <MDBInput 
              wrapperClass='mb-4' 
              label='Password' 
              id='formControlLg' 
              type='password' 
              size="lg" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
              disabled={isSubmitting}
            />
          <div className="d-flex justify-content-between mb-4">
            <MDBCheckbox 
              name='flexCheck' 
              value='' 
              id='flexCheckDefault' 
              label='Remember me' 
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              disabled={isSubmitting}
            />
            <a href="/forgot-password">Şifremi unuttum</a>
          </div>
            {error && <div className="text-danger mb-3">{error}</div>}
          <div className='text-center text-md-start mt-4 pt-2'>
              <MDBBtn 
                className="mb-0 px-5" 
                size='lg' 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Giriş yapılıyor...
                  </>
                ) : (
                  'Giriş Yap'
                )}
              </MDBBtn>
              <p className="small fw-bold mt-2 pt-1 mb-2">Hesabın yok mu? <a href="/RegisterPage" className="link-danger">Kayıt Ol</a></p>
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

// Wrap with ProtectedRoute to redirect if already authenticated
const LoginPageWrapper = () => (
  <ProtectedRoute requireAuth={false}>
    <LoginPage />
  </ProtectedRoute>
);

export default LoginPageWrapper;