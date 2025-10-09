const API_BASE_URL = '/.netlify/functions/auth';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('softnews_token');
    this.user = JSON.parse(localStorage.getItem('softnews_user') || 'null');
  }

  // API call helper
  async apiCall(action, options = {}) {
    const url = `${API_BASE_URL}?action=${action}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'API call failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await this.apiCall('register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      if (response.success) {
        this.setAuthData(response.user, response.token);
        this.dispatchAuthEvent();
      }

      return response;
    } catch (error) {
      throw new Error(error.message || 'Kayıt işlemi başarısız');
    }
  }

  // Login user
  async login(email, password) {
    try {
      const response = await this.apiCall('login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (response.success) {
        this.setAuthData(response.user, response.token);
        this.dispatchAuthEvent();
      }

      return response;
    } catch (error) {
      throw new Error(error.message || 'Giriş işlemi başarısız');
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem('softnews_token');
    localStorage.removeItem('softnews_user');
    this.token = null;
    this.user = null;
    this.dispatchAuthEvent();
  }

  // Verify token
  async verifyToken() {
    if (!this.token) {
      return false;
    }

    try {
      const response = await this.apiCall('verify');
      if (response.success) {
        this.user = response.user;
        localStorage.setItem('softnews_user', JSON.stringify(this.user));
        return true;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      this.logout();
    }

    return false;
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await this.apiCall('profile');
      if (response.success) {
        this.user = response.user;
        localStorage.setItem('softnews_user', JSON.stringify(this.user));
        return response.user;
      }
    } catch (error) {
      throw new Error(error.message || 'Profil bilgileri alınamadı');
    }
  }

  // Update profile
  async updateProfile(profileData) {
    try {
      const response = await this.apiCall('profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      if (response.success) {
        this.user = response.user;
        localStorage.setItem('softnews_user', JSON.stringify(this.user));
        this.dispatchAuthEvent();
      }

      return response;
    } catch (error) {
      throw new Error(error.message || 'Profil güncellenemedi');
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await this.apiCall('/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Şifre değiştirilemedi');
    }
  }

  // Helper methods
  setAuthData(user, token) {
    this.user = user;
    this.token = token;
    localStorage.setItem('softnews_user', JSON.stringify(user));
    localStorage.setItem('softnews_token', token);
  }

  dispatchAuthEvent() {
    window.dispatchEvent(new CustomEvent('softnews_auth_change', {
      detail: { user: this.user, isAuthenticated: !!this.user }
    }));
  }

  // Getters
  get isAuthenticated() {
    return !!this.user && !!this.token;
  }

  get currentUser() {
    return this.user;
  }

  get currentToken() {
    return this.token;
  }

  // Validation helpers
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password) {
    // En az 8 karakter, büyük harf, küçük harf, rakam ve özel karakter
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  getPasswordStrength(password) {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
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
  }
}

// Singleton instance
const authService = new AuthService();

export default authService;
