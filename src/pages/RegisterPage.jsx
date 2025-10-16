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
    console.log('handleRegister called!');
    console.log('formData:', formData);
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

    if (formData.password.length < 6) {
      setToast({ 
        message: 'Şifre en az 6 karakter olmalıdır.', 
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
      console.log('Registering with data:', {
        name: formData.name,
        email: formData.email,
        password: '***'
      });
      
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Register response:', response);

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
            
            
            <div className="mb-4">
              <label className="form-label">Ad Soyad</label>
              <input
                type="text"
                className="form-control form-control-lg"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="mb-4">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="mb-4">
              <label className="form-label">Şifre</label>
              <input
                type="password"
                className="form-control form-control-lg"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>
            
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
            
            <div className="mb-4">
              <label className="form-label">Şifre Tekrar</label>
              <input
                type="password"
                className="form-control form-control-lg"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>
            
            {error && <div className="text-danger mb-3">{error}</div>}
            
            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 mb-0 px-5"
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
            </button>
            
            <p className="small fw-bold mt-4 pt-1 mb-2 text-center">
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