import authService from './authService';

import API_BASE_URL from './api';


class AdminCaixaService {
  async listarRelatorioCaixa() {
    const token = authService.getAccessToken();
    
    // Pega a data de hoje no formato YYYY-MM-DD
    const dataAtual = new Date();
    // Ajuste de fuso horário para o Brasil
    const hoje = new Date(dataAtual.getTime() - (dataAtual.getTimezoneOffset() * 60000))
                    .toISOString()
                    .split('T')[0];

    // Monta a URL passando a data de hoje como início e fim
    const url = `${API_BASE_URL}/caixa-diario/relatorio/?data_inicio=${hoje}&data_fim=${hoje}`;

    const response = await fetch(url, { 
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    
    if (response.status === 401) {
      await authService.refreshToken();
      return this.listarRelatorioCaixa();
    }

    if (!response.ok) throw new Error('Erro ao buscar o relatório do caixa');
    return await response.json();
  }
}

export default new AdminCaixaService();