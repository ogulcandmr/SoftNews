import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MDBContainer, MDBCol, MDBRow, MDBBtn, MDBInput, MDBProgress } from 'mdb-react-ui-kit';
import ToastMessage from '../components/ToastMessage';
import ProtectedRoute from '../components/ProtectedRoute';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [email, setEmail] = useState('');
  const [toast, setToast] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, level: 'weak' });
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setToast({ message: 'Geçersiz şifre sıfırlama bağlantısı.', type: 'error' });
      setTimeout(() => navigate('/forgot-password'), 2000);
      return;
    }

    // Verify token
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/password-reset/verify-reset-token/${token}`);
        const data = await response.json();

        if (data.success) {
          setIsValidToken(true);
          setEmail(data.data.email);
        } else {
          setToast({ message: data.message, type: 'error' });
          setTimeout(() => navigate('/forgot-password'), 2000);
        }
      } catch (error) {
        setToast({ message: 'Token doğrulanamadı.', type: 'error' });
        setTimeout(() => navigate('/forgot-password'), 2000);
      } finally {
        setIsValidating(false);
      }
    };

    verifyToken();
  }, [token, navigate]);

  useEffect(() => {
    if (formData.newPassword) {
      const strength = getPasswordStrength(formData.newPassword);
      setPasswordStrength(strength);
    }
  }, [formData.newPassword]);

  const getPasswordStrength = (password) => {
    let strength = 0;
    const checks = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };

    strength = Object.values(checks).filter(Boolean).length;

    return {
      strength,
      checks,
      level: strength < 3 ? 'weak' : strength < 5 ? 'medium' : 'strong'
    };
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.newPassword !== formData.confirmPassword) {
      setToast({ message: 'Şifreler eşleşmiyor.', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/password-reset/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setToast({ 
          message: data.message, 
          type: 'success' 
        });
        setTimeout(() => navigate('/LoginPage'), 2000);
      } else {
        setToast({ 
          message: data.message, 
          type: 'error' 
        });
      }
    } catch (error) {
      setToast({ 
        message: 'Bir hata oluştu. Lütfen tekrar deneyin.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <MDBContainer fluid className="p-3 my-5 h-custom">
        <MDBRow className="justify-content-center">
          <MDBCol md='6' className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
            <p className="mt-3">Token doğrulanıyor...</p>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    );
  }

  if (!isValidToken) {
    return (
      <MDBContainer fluid className="p-3 my-5 h-custom">
        <MDBRow className="justify-content-center">
          <MDBCol md='6' className="text-center">
            <h3 className="text-danger">Geçersiz Token</h3>
            <p>Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.</p>
            <MDBBtn color="primary" onClick={() => navigate('/forgot-password')}>
              Yeni Şifre Sıfırlama Talebi
            </MDBBtn>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    );
  }

  return (
    <MDBContainer fluid className="p-3 my-5 h-custom">
      <MDBRow className="justify-content-center">
        <MDBCol md='6'>
          <div className="text-center mb-4">
            <h3>Yeni Şifre Belirle</h3>
            <p className="text-muted">
              {email} için yeni şifrenizi belirleyin.
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <MDBInput 
              wrapperClass='mb-4' 
              label='Yeni Şifre' 
              type='password' 
              size="lg" 
              name="newPassword"
              value={formData.newPassword} 
              onChange={handleInputChange} 
              required
              disabled={isSubmitting}
            />
            
            {formData.newPassword && (
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
            
            <MDBBtn 
              className="mb-0 px-5 w-100" 
              size='lg' 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Şifre Sıfırlanıyor...
                </>
              ) : (
                'Şifreyi Sıfırla'
              )}
            </MDBBtn>
            
            <p className="small fw-bold mt-2 pt-1 mb-2 text-center">
              <a href="/LoginPage" className="link-primary">Giriş sayfasına dön</a>
            </p>
          </form>
        </MDBCol>
      </MDBRow>
      {toast && <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </MDBContainer>
  );
}

// Wrap with ProtectedRoute to redirect if already authenticated
const ResetPasswordPageWrapper = () => (
  <ProtectedRoute requireAuth={false}>
    <ResetPasswordPage />
  </ProtectedRoute>
);

export default ResetPasswordPageWrapper;
