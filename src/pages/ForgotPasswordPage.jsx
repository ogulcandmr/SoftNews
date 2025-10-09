import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MDBContainer, MDBCol, MDBRow, MDBBtn, MDBInput } from 'mdb-react-ui-kit';
import ToastMessage from '../components/ToastMessage';
import ProtectedRoute from '../components/ProtectedRoute';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/.netlify/functions/password-reset/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setToast({ 
          message: data.message, 
          type: 'success' 
        });
        // For demo purposes, show the reset token
        if (data.resetToken) {
          setTimeout(() => {
            navigate(`/reset-password?token=${data.resetToken}`);
          }, 2000);
        }
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

  return (
    <MDBContainer fluid className="p-3 my-5 h-custom">
      <MDBRow className="justify-content-center">
        <MDBCol md='6'>
          <div className="text-center mb-4">
            <h3>Şifremi Unuttum</h3>
            <p className="text-muted">
              Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <MDBInput 
              wrapperClass='mb-4' 
              label='Email address' 
              type='email' 
              size="lg" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
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
                  Gönderiliyor...
                </>
              ) : (
                'Şifre Sıfırlama Bağlantısı Gönder'
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
const ForgotPasswordPageWrapper = () => (
  <ProtectedRoute requireAuth={false}>
    <ForgotPasswordPage />
  </ProtectedRoute>
);

export default ForgotPasswordPageWrapper;
