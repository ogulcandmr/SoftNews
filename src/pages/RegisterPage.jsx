import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MDBContainer, MDBCol, MDBRow, MDBBtn, MDBInput, MDBProgress } from 'mdb-react-ui-kit';
import ToastMessage from '../components/ToastMessage';
import socialAuthService from '../services/socialAuthService';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, level: 'weak' });
  
  const { register, error, clearError, validateEmail, validatePassword, getPasswordStrength } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (formData.password) {
      const strength = getPasswordStrength(formData.password);
      setPasswordStrength(strength);
    }
  }, [formData.password, getPasswordStrength]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoogleSignUp = async () => {
    setIsSubmitting(true);
    try {
      const res = await socialAuthService.signInWithGoogle();
      if (res?.success) {
        setToast({ message: 'Google ile giriş başarılı!', type: 'success' });
        setTimeout(() => navigate('/'), 800);
      }
    } catch (e) {
      setToast({ message: e?.message || 'Google ile giriş başarısız.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGitHubSignUp = async () => {
    try {
      await socialAuthService.signInWithGitHub();
      // Redirect eder, burada ekstra bir şey yok
    } catch (e) {
      setToast({ message: e?.message || 'GitHub ile giriş başlatılamadı.', type: 'error' });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setToast({ message: 'Lütfen tüm alanları doldurun.', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setToast({ message: 'Geçerli bir email adresi giriniz.', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      setToast({ 
        message: 'Şifre en az 6 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter içermelidir.', 
        type: 'error' 
      });
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setToast({ message: 'Şifreler eşleşmiyor.', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        setToast({ message: 'Kayıt başarılı! Giriş yapabilirsiniz.', type: 'success' });
        setTimeout(() => navigate('/LoginPage'), 1200);
      }
    } catch (error) {
      setToast({ message: error.message || 'Kayıt işlemi başarısız!', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = (level) => {
    switch (level) {
      case 'weak': return 'danger';
      case 'medium': return 'warning';
      case 'strong': return 'success';
      default: return 'secondary';
    }
  };

  const getPasswordStrengthText = (level) => {
    switch (level) {
      case 'weak': return 'Zayıf';
      case 'medium': return 'Orta';
      case 'strong': return 'Güçlü';
      default: return '';
    }
  };

  return (
    <MDBContainer fluid className="p-3 my-5 h-custom">
      <MDBRow className="justify-content-center">
        <MDBCol md='6'>
          <form onSubmit={handleRegister}>
            <h3 className="mb-4 text-center">Kayıt Ol</h3>
            
            {/* Social Auth Buttons */}
            <div className="d-flex flex-row align-items-center justify-content-center mb-4">
              <p className="lead fw-normal mb-0 me-3">Sosyal medya ile kayıt ol</p>
              <MDBBtn 
                floating 
                size='md' 
                className='me-2' 
                onClick={handleGoogleSignUp}
                disabled={isSubmitting}
                style={{ backgroundColor: '#db4437', borderColor: '#db4437' }}
                title="Google ile Kayıt Ol"
                type="button"
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
                onClick={handleGitHubSignUp}
                disabled={isSubmitting}
                style={{ backgroundColor: '#333', borderColor: '#333' }}
                title="GitHub ile Kayıt Ol"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="white" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </MDBBtn>
            </div>

            <div className="divider d-flex align-items-center my-4">
              <p className="text-center fw-bold mx-3 mb-0">Veya</p>
            </div>
            
            <MDBInput 
              wrapperClass='mb-4' 
              label='Ad Soyad' 
              type='text' 
              size="lg" 
              name="name"
              value={formData.name} 
              onChange={handleInputChange} 
              required
              disabled={isSubmitting}
            />
            
            <MDBInput 
              wrapperClass='mb-4' 
              label='Email address' 
              type='email' 
              size="lg" 
              name="email"
              value={formData.email} 
              onChange={handleInputChange} 
              required
              disabled={isSubmitting}
            />
            
            <MDBInput 
              wrapperClass='mb-4' 
              label='Password' 
              type='password' 
              size="lg" 
              name="password"
              value={formData.password} 
              onChange={handleInputChange} 
              required
              disabled={isSubmitting}
            />
            
            {formData.password && (
              <div className="mb-3">
                <MDBProgress 
                  value={passwordStrength.strength * 20} 
                  color={getPasswordStrengthColor(passwordStrength.level)}
                  className="mb-2"
                />
                <small className={`text-${getPasswordStrengthColor(passwordStrength.level)}`}>
                  Şifre Gücü: {getPasswordStrengthText(passwordStrength.level)}
                </small>
              </div>
            )}
            
            <MDBInput 
              wrapperClass='mb-4' 
              label='Şifre Tekrar' 
              type='password' 
              size="lg" 
              name="confirmPassword"
              value={formData.confirmPassword} 
              onChange={handleInputChange} 
              required
              disabled={isSubmitting}
            />
            
            {error && <div className="text-danger mb-3">{error}</div>}
            
            <MDBBtn 
              className="mb-0 px-5 w-100" 
              size='lg' 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Kayıt yapılıyor...
                </>
              ) : (
                'Kayıt Ol'
              )}
            </MDBBtn>

            <div className="my-3 text-center text-muted">veya</div>

            <div className="d-grid gap-2 mb-3">
              <MDBBtn color="danger" outline disabled={isSubmitting} onClick={handleGoogleSignUp}>
                <span className="me-2">🔴</span> Google ile Kayıt Ol / Giriş Yap
              </MDBBtn>
              <MDBBtn color="dark" outline onClick={handleGitHubSignUp}>
                <span className="me-2">🐱</span> GitHub ile Kayıt Ol / Giriş Yap
              </MDBBtn>
            </div>
            
            <p className="small fw-bold mt-2 pt-1 mb-2 text-center">
              Zaten hesabın var mı? <a href="/LoginPage" className="link-primary">Giriş Yap</a>
            </p>
          </form>
        </MDBCol>
      </MDBRow>
      {toast && <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </MDBContainer>
  );
}

// Wrap with ProtectedRoute to redirect if already authenticated
const RegisterPageWrapper = () => (
  <ProtectedRoute requireAuth={false}>
    <RegisterPage />
  </ProtectedRoute>
);

export default RegisterPageWrapper; 