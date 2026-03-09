import authService from './authService';
import API_BASE_URL from './api';


const extrairData = (dataISO) => {
  if (!dataISO) return dataISO;
  return dataISO.split('T')[0];
};

class MedicoPacientesService {
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

    if (data.results) {
      data.results = data.results.map(paciente => ({
        ...paciente,
        data_nascimento: extrairData(paciente.data_nascimento),
        data_cadastro: extrairData(paciente.data_cadastro)
      }));
    }

    return data;
  }

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

export default new MedicoPacientesService();