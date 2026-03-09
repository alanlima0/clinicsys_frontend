import authService from './authService';

import API_BASE_URL from './api';


class AdminProcedimentosService {
  async listarProcedimentos(page = 1, search = '') {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/procedimentos/?page=${page}&search=${search}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.listarProcedimentos(page, search);
    }

    if (!response.ok) throw new Error('Erro ao buscar procedimentos');
    return await response.json();
  }

  async criarProcedimento(dadosProcedimento) {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/procedimentos/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosProcedimento),
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.criarProcedimento(dadosProcedimento);
    }

    if (!response.ok) throw new Error('Erro ao cadastrar procedimento');
    return await response.json();
  }

  async atualizarProcedimento(id, dadosProcedimento) {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/procedimentos/${id}/`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosProcedimento),
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.atualizarProcedimento(id, dadosProcedimento);
    }

    if (!response.ok) throw new Error('Erro ao atualizar procedimento');
    return await response.json();
  }

  async deletarProcedimento(id) {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/procedimentos/${id}/`; 

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.deletarProcedimento(id);
    }

    if (!response.ok) throw new Error('Erro ao apagar procedimento');
    return true; 
  }
}

export default new AdminProcedimentosService();