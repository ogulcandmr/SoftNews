import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import socialAuthService from '../services/socialAuthService';
import ToastMessage from '../components/ToastMessage';

function GitHubCallbackPage() {
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || state !== 'github') {
          setToast({ 
            message: 'Geçersiz GitHub callback.', 
            type: 'error' 
          });
          setTimeout(() => navigate('/LoginPage'), 2000);
          return;
        }

        const response = await socialAuthService.handleGitHubCallback(code);
        
        if (response.success) {
          setToast({ 
            message: 'GitHub ile başarıyla giriş yapıldı!', 
            type: 'success' 
          });
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error) {
        setToast({ 
          message: error.message || 'GitHub ile giriş yapılamadı!', 
          type: 'error' 
        });
        setTimeout(() => navigate('/LoginPage'), 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <MDBContainer fluid className="p-3 my-5 h-custom">
      <MDBRow className="justify-content-center">
        <MDBCol md='6' className="text-center">
          {isProcessing ? (
            <>
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Yükleniyor...</span>
              </div>
              <h4>GitHub ile giriş yapılıyor...</h4>
              <p className="text-muted">Lütfen bekleyin.</p>
            </>
          ) : (
            <>
              <h4>İşlem tamamlandı!</h4>
              <p className="text-muted">Yönlendiriliyorsunuz...</p>
            </>
          )}
        </MDBCol>
      </MDBRow>
      {toast && <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </MDBContainer>
  );
}

export default GitHubCallbackPage;
