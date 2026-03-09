import authService from './authService';

import API_BASE_URL from './api';


class AdminUsuariosService {
  async listarUsuarios(page = 1) {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/users/?page=${page}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.listarUsuarios(page);
    }

    if (!response.ok) throw new Error('Erro ao buscar usuários');
    return await response.json();
  }

  async criarUsuario(dadosUsuario) {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/users/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosUsuario),
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.criarUsuario(dadosUsuario);
    }

    if (!response.ok) throw new Error('Erro ao cadastrar usuario');
    return await response.json();
  }

  async atualizarUsuario(id, dadosUsuario) {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/users/${id}/`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosUsuario),
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.atualizarUsuario(id, dadosUsuario);
    }

    if (!response.ok) throw new Error('Erro ao atualizar usuário');
    return await response.json();
  }

  async deletarUsuario(id) {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/users/${id}/`; 

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.deletarUsuario(id);
    }

    if (!response.ok) throw new Error('Erro ao apagar usuario');
    return true; 
  }
}

export default new AdminUsuariosService();