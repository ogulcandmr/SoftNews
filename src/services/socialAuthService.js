class SocialAuthService {
  constructor() {
    // Use Vite client-side env vars; fallback to older REACT_APP_* names if provided in build-time
    this.googleClientId =
      (import.meta?.env?.VITE_GOOGLE_CLIENT_ID || import.meta?.env?.REACT_APP_GOOGLE_CLIENT_ID || import.meta?.env?.GOOGLE_CLIENT_ID) || '';
    this.githubClientId =
      (import.meta?.env?.VITE_GITHUB_CLIENT_ID || import.meta?.env?.REACT_APP_GITHUB_CLIENT_ID || import.meta?.env?.GITHUB_CLIENT_ID) || '';

    // Debug logs to help diagnose wrong IDs in production (will be stripped in minification but useful locally)
    try {
      console.log('[SocialAuth] GoogleClientId present:', !!this.googleClientId);
      console.log('[SocialAuth] GitHubClientId present:', !!this.githubClientId);
    } catch (_) {}
  }

  // Google Sign-In
  async signInWithGoogle() {
    try {
      if (!this.googleClientId) {
        throw new Error('Google Client ID is missing. Please set VITE_GOOGLE_CLIENT_ID.');
      }
      // Load Google API
      await this.loadGoogleAPI();
      
      // Initialize Google Auth
      const authInstance = window.gapi.auth2.getAuthInstance();
      const googleUser = await authInstance.signIn();
      const idToken = googleUser.getAuthResponse().id_token;

      // Send token to backend
      const response = await fetch('/api/social-auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await response.json();

      if (data.success) {
        // Store auth data
        localStorage.setItem('softnews_user', JSON.stringify(data.data.user));
        localStorage.setItem('softnews_token', data.data.token);
        
        // Dispatch auth change event
        window.dispatchEvent(new CustomEvent('softnews_auth_change', {
          detail: { user: data.data.user, isAuthenticated: true }
        }));

        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      throw error;
    }
  }

  // GitHub Sign-In
  async signInWithGitHub() {
    try {
      // Redirect to GitHub OAuth
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${this.githubClientId}&scope=user:email&state=github&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/github/callback')}`;
      window.location.href = githubAuthUrl;
    } catch (error) {
      console.error('GitHub Sign-In error:', error);
      throw error;
    }
  }

  // Handle GitHub callback
  async handleGitHubCallback(code) {
    try {
      const redirectUri = `${window.location.origin}/auth/github/callback`;
      const response = await fetch('/api/social-auth/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, redirectUri }),
      });

      const data = await response.json();

      if (data.success) {
        // Store auth data
        localStorage.setItem('softnews_user', JSON.stringify(data.data.user));
        localStorage.setItem('softnews_token', data.data.token);
        
        // Dispatch auth change event
        window.dispatchEvent(new CustomEvent('softnews_auth_change', {
          detail: { user: data.data.user, isAuthenticated: true }
        }));

        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('GitHub callback error:', error);
      throw error;
    }
  }

  // Load Google API
  async loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('auth2', () => {
          window.gapi.auth2.init({
            client_id: this.googleClientId,
          }).then(resolve).catch(reject);
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Check if GitHub callback
  isGitHubCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('code') && urlParams.get('state') === 'github';
  }

  // Get GitHub code from URL
  getGitHubCode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
  }
}

// Singleton instance
const socialAuthService = new SocialAuthService();

export default socialAuthService;
