// src/services/authService.js
import API_BASE_URL from './api';


class AuthService {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro ao fazer login.');
    }

    const data = await response.json();
    this.setTokens(data.access, data.refresh);
    return data;
  }

  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      throw new Error('Refresh token não encontrado');
    }

    const response = await fetch(`${API_BASE_URL}/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      this.logout();
      throw new Error('Sessão expirada');
    }

    const data = await response.json();
    this.setTokens(data.access, data.refresh);
    return data;
  }

  async getUserData() {
    const cached = this.getCachedUserData();
    if (cached) return cached;

    const response = await fetch(`${API_BASE_URL}/users/me/`, {
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
    });

    if (response.status === 401) {
      await this.refreshToken();
      return this.getUserData();
    }

    if (!response.ok) {
      throw new Error('Erro ao obter dados do usuário');
    }

    const data = await response.json();
    this.setUserData(data);
    return data;
  }

  setTokens(accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }

  setUserData(userData) {
    localStorage.setItem('user_data', JSON.stringify(userData));
  }

  getCachedUserData() {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  }
}

export default new AuthService();
