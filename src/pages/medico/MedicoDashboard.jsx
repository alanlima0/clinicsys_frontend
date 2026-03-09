import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Importação nova para navegar entre telas
import medicoPacientesService from '../../services/medicoPacientesService';
import './MedicoDashboard.css';

import Header from '../../components/HeaderMedico';

const MedicoDashboard = () => {
  const navigate = useNavigate(); 
  
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  // Estados para Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [feedback, setFeedback] = useState({ texto: '', tipo: '' });

  const mostrarMensagem = (texto, tipo) => {
    setFeedback({ texto, tipo });
    setTimeout(() => {
      setFeedback({ texto: '', tipo: '' });
    }, 3000);
  };

  const formatarData = (dataString) => {
    if (!dataString) return '--';
    const dataSemHora = dataString.split('T')[0];
    const [ano, mes, dia] = dataSemHora.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const calcularIdade = (dataNasc) => {
    if (!dataNasc) return '--';
    const hoje = new Date();
    const nascimento = new Date(dataNasc.split('T')[0] + 'T12:00:00');
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const carregarPacientes = async (pagina = 1, termo = '') => {
    try {
      setLoading(true);
      const data = await medicoPacientesService.listarPacientes(pagina, termo);
      setPacientes(data.results || []);
      
      if (data.count) {
        setTotalPaginas(Math.ceil(data.count / 10));
      } else {
        setTotalPaginas(data.next ? pagina + 1 : pagina);
      }
    } catch (error) {
      console.error(error);
      mostrarMensagem('Erro ao carregar a lista de pacientes.', 'erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPacientes(paginaAtual, busca);
  }, [paginaAtual]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPaginaAtual(1); 
    carregarPacientes(1, busca);
  };

  // função que leva para a tela do prontuário
  const handleAcessarProntuario = (paciente) => {
    navigate(`/medico/paciente/${paciente.id}/historico`); 
  };

  return (
    <div className="container">
      <Header />

      {feedback.texto && (
        <div className={`toast-msg ${feedback.tipo}`}>
          {feedback.texto}
        </div>
      )}

      {/* Busca */}
      <div className="card">
        <h3>BUSCAR PACIENTE</h3>
        <form onSubmit={handleSearch} className="search-box">
          <input 
            type="text" 
            placeholder="Digite o nome do paciente..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button type="submit" className="btn-search">BUSCAR</button>
        </form>
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="header-lista">
          <h3>BASE DE PACIENTES</h3>
        </div>

        <table className="pacientes-table">
          <thead>
            <tr>
              <th>DATA DE CADASTRO</th>
              <th>NOME DO PACIENTE</th>
              <th>IDADE</th>
              <th>SEXO</th>
              <th style={{ textAlign: 'center' }}>AÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="loading-text">A carregar dados...</td></tr>
            ) : pacientes.length === 0 ? (
              <tr><td colSpan="5" className="empty-text">Nenhum paciente encontrado.</td></tr>
            ) : (
              pacientes.map(p => (
                <tr key={p.id}>
                  <td>{formatarData(p.data_cadastro)}</td>
                  <td><strong>{p.nome.toUpperCase()}</strong></td>
                  <td>{calcularIdade(p.data_nascimento)} anos</td>
                  <td>{p.sexo === 'M' ? 'MASCULINO' : 'FEMININO'}</td>
                  <td style={{ textAlign: 'center' }}>
                    
                    {/* 👇 Botão atualizado chamando a navegação */}
                    <button 
                      className="btn-action view btn-prontuario" 
                      onClick={() => handleAcessarProntuario(p)}
                    >
                      👁️ VER PRONTUÁRIO
                    </button>
                    
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginação */}
        {!loading && pacientes.length > 0 && (
          <div className="paginacao">
            <button className="btn-paginacao" disabled={paginaAtual === 1} onClick={() => setPaginaAtual(paginaAtual - 1)}>
              ◀ Anterior
            </button>
            <span className="info-paginacao">
              Página <b>{paginaAtual}</b> {totalPaginas > 1 ? `de ${totalPaginas}` : ''}
            </span>
            <button className="btn-paginacao" disabled={paginaAtual >= totalPaginas && pacientes.length < 10} onClick={() => setPaginaAtual(paginaAtual + 1)}>
              Próxima ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicoDashboard;