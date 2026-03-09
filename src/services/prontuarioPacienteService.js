import authService from './authService';
import API_BASE_URL from './api';

class ProntuarioPacienteService {
  
  // Busca os dados cadastrais do paciente
  async obterPaciente(pacienteId) {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/pacientes/${pacienteId}/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar dados do paciente');
    return await response.json();
  }

  // Busca a lista de atendimentos (histórico) desse paciente
  async obterHistorico(pacienteId) {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/atendimentos/?paciente=${pacienteId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar histórico de atendimentos');
    return await response.json();
  }

  // Busca os dados completos de um atendimento específico do histórico (Triagem, etc)
  async obterDetalhesAtendimento(atendimentoId) {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/atendimentos/${atendimentoId}/prontuario/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao buscar prontuário');
    return await response.json();
  }

  // Anamnese e Prescrição (vinculados ao ID do Atendimento)
  async obterAnamnese(atendimentoId) {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/atendimentos/${atendimentoId}/anamnese/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 404) return null; 
    if (!response.ok) throw new Error('Erro ao buscar anamnese');
    return await response.json();
  }

  async obterPrescricoes(atendimentoId) {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/atendimentos/${atendimentoId}/prescricoes/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 404) return []; 
    if (!response.ok) throw new Error('Erro ao buscar prescrições');
    return await response.json();
  }

  async salvarAnamnese(atendimentoId, dados) {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/atendimentos/${atendimentoId}/anamnese/`, {
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

  async salvarPrescricao(atendimentoId, dados) {
    const token = authService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/atendimentos/${atendimentoId}/prescricoes/`, {
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
}

export default new ProntuarioPacienteService();