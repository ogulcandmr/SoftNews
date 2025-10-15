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
          <h3 className="text-center mb-4">Giriş Yap</h3>
          <div className="d-flex flex-column align-items-center justify-content-center mb-4">
            <p className="lead fw-normal mb-3">Sosyal medya ile giriş yap</p>
            <div className="d-flex gap-3">
            <MDBBtn 
              floating 
              size='md' 
              className='me-2' 
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              style={{ backgroundColor: '#db4437', borderColor: '#db4437' }}
              title="Google ile Giriş Yap"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </MDBBtn>
            <MDBBtn 
              floating 
              size='md' 
              className='me-2' 
              onClick={handleGitHubSignIn}
              disabled={isSubmitting}
              style={{ backgroundColor: '#333', borderColor: '#333' }}
              title="GitHub ile Giriş Yap"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </MDBBtn>
            </div>
          </div>
          <div className="divider d-flex align-items-center my-4">
            <p className="text-center fw-bold mx-3 mb-0">Veya</p>
          </div>
          <form onSubmit={handleLogin}>
            <MDBInput 
              wrapperClass='mb-4' 
              label='Email address' 
              id='loginEmail' 
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
              id='loginPassword' 
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