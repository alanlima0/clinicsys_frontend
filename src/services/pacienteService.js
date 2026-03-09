import authService from './authService';
import API_BASE_URL from './api';

const extrairData = (dataISO) => {
  if (!dataISO) return dataISO;
  return dataISO.split('T')[0];
};

class PacienteService {
  async listarPacientes(page = 1, search = '') {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/pacientes/?page=${page}&search=${search}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.listarPacientes(page, search);
    }

    if (!response.ok) throw new Error('Erro ao buscar pacientes');
    
    const data = await response.json();

    // Limpa a sujeira de timezone assim que chega da API
    if (data.results) {
      data.results = data.results.map(paciente => ({
        ...paciente,
        data_nascimento: extrairData(paciente.data_nascimento),
        data_cadastro: extrairData(paciente.data_cadastro)
      }));
    }

    return data;
  }

  async criarPaciente(dadosPaciente) {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/pacientes/`;

    // Limpa a data antes de enviar (evita que o navegador mande hora junto)
    const payload = { ...dadosPaciente };
    if (payload.data_nascimento) payload.data_nascimento = extrairData(payload.data_nascimento);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.criarPaciente(dadosPaciente);
    }

    if (!response.ok) throw new Error('Erro ao cadastrar paciente');
    return await response.json();
  }

  async atualizarPaciente(id, dadosPaciente) {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/pacientes/${id}/`;

    // Limpa a data antes de enviar
    const payload = { ...dadosPaciente };
    if (payload.data_nascimento) payload.data_nascimento = extrairData(payload.data_nascimento);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.atualizarPaciente(id, dadosPaciente);
    }

    if (!response.ok) throw new Error('Erro ao atualizar paciente');
    return await response.json();
  }

  async deletarPaciente(id) {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/pacientes/${id}/`; 

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.deletarPaciente(id);
    }

    if (!response.ok) throw new Error('Erro ao apagar paciente');
    return true; 
  }

  // --- FUNÇÕES DA FILA DE ATENDIMENTO ---
  async listarProcedimentos() {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/procedimentos/`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.listarProcedimentos();
    }

    if (!response.ok) throw new Error('Erro ao buscar procedimentos');
    return await response.json();
  }

  async criarAtendimento(dadosAtendimento) {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/atendimentos/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosAtendimento),
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.criarAtendimento(dadosAtendimento);
    }

    if (!response.ok) throw new Error('Erro ao adicionar à fila');
    return await response.json();
  }

  // --- NOVA FUNÇÃO: HISTÓRICO DO PACIENTE ---
  async listarAtendimentosPorPaciente(pacienteId) {
    const token = authService.getAccessToken();
    const url = `${API_BASE_URL}/atendimentos/?paciente=${pacienteId}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (response.status === 401) {
      await authService.refreshToken();
      return this.listarAtendimentosPorPaciente(pacienteId);
    }

    if (!response.ok) throw new Error('Erro ao buscar histórico do paciente');
    return await response.json();
  }
}

export default new PacienteService();