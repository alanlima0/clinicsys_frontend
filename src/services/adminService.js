import authService from './authService';

import API_BASE_URL from './api';


class AdminService {
  obterDataHoje() {
    const dataAtual = new Date();
    return new Date(dataAtual.getTime() - (dataAtual.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
  }

  async totalAtendimentos() {
    const token = authService.getAccessToken();
    const hoje = this.obterDataHoje();
    
    const url = `${API_BASE_URL}/atendimentos/?data=${hoje}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.totalAtendimentos();
    }

    if (!response.ok) throw new Error('Erro ao obter count de atendimentos');

    const data = await response.json();
    return data.count; 
  }

  async caixaTotal(){
    const token = authService.getAccessToken();
    const hoje = this.obterDataHoje();

    const url = `${API_BASE_URL}/caixa-diario/relatorio/?data_inicio=${hoje}&data_fim=${hoje}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.caixaTotal();
    }

    if (!response.ok) throw new Error('Erro ao obter o valor do caixa');

    const data = await response.json();
    return data.total_geral; 
  }

  async procedimentosTotal(){
    const token = authService.getAccessToken();
    const hoje = this.obterDataHoje();
    
    // const url = `${API_BASE_URL}/procedimentos/?data=${hoje}`;
    const url = `${API_BASE_URL}/procedimentos/`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.procedimentosTotal();
    }

    if (!response.ok) throw new Error('Erro ao obter a quantidade de procedimentos');

    const data = await response.json();
    return data.count; 
  }
  
}

export default new AdminService();