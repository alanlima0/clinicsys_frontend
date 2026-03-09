import authService from './authService';

import API_BASE_URL from './api';


class AtendimentoService {
  
  // ==========================================
  // ROTAS DA FILA E PAINEL DA TV
  // ==========================================

  async listarFila() {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/atendimentos/fila/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Erro ao buscar fila');
    return await response.json();
  }

  async chamarPaciente(id) {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/atendimentos/${id}/chamar/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Erro ao chamar paciente');
    return await response.json();
  }

  async obterUltimoChamado() {
    const response = await fetch(`${API_BASE_URL}/atendimentos/ultimo-chamado/`);
    if (!response.ok) throw new Error('Erro ao buscar último chamado');
    return await response.json();
  }

  // ==========================================
  // ROTAS DO PRONTUÁRIO MÉDICO
  // ==========================================

  async obterProntuarioCompleto(id) {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/atendimentos/${id}/prontuario/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar prontuário');
    return await response.json();
  }

  async obterHistoricoPaciente(id) {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/atendimentos/${id}/historico/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar histórico');
    return await response.json();
  }

  async obterAnamnese(id) {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/atendimentos/${id}/anamnese/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 404) return null; 
    if (!response.ok) throw new Error('Erro ao buscar anamnese');
    return await response.json();
  }

  async obterPrescricoes(id) {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/atendimentos/${id}/prescricoes/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 404) return []; 
    if (!response.ok) throw new Error('Erro ao buscar prescrições');
    return await response.json();
  }

  async salvarAnamnese(id, dados) {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/atendimentos/${id}/anamnese/`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    });
    if (!response.ok) throw new Error('Erro ao salvar anamnese');
    return await response.json();
  }

  async salvarPrescricao(id, dados) {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/atendimentos/${id}/prescricoes/`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    });
    if (!response.ok) throw new Error('Erro ao salvar prescrição');
    return await response.json();
  }

  async finalizarAtendimento(id) {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/atendimentos/${id}/finalizar/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.erro || 'Erro ao finalizar atendimento');
    }
    return await response.json();
  }
}

export default new AtendimentoService();