import authService from './authService';

import API_BASE_URL from './api';


class FilaRecepcaoService {
  async listarFilaAtendimento() {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/atendimentos/fila/`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.listarFilaAtendimento();
    }

    if (!response.ok) throw new Error('Erro ao buscar fila de atendimento');
    return await response.json();
  }

  async deletarAtendimento(id) {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/atendimentos/${id}/`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.deletarAtendimento(id);
    }

    if (!response.ok) throw new Error('Erro ao remover paciente da fila');
    return true;
  }

  async criarTriagem(dadosTriagem) {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/triagens/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosTriagem),
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.criarTriagem(dadosTriagem);
    }

    if (!response.ok) throw new Error('Erro ao salvar triagem');
    return await response.json();
  }
}

export default new FilaRecepcaoService();