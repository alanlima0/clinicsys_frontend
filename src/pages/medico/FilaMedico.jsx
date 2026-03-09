import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import atendimentoService from '../../services/atendimentoService';
import './FilaMedico.css';

import Header from '../../components/HeaderMedico';

const FilaMedico = () => {
  const [fila, setFila] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate(); 

  const carregarFila = async () => {
    try {
      const dados = await atendimentoService.listarFila();
      const listaBruta = dados.results || dados || [];
      
      const pacientesAgrupados = {};

      listaBruta.forEach(item => {
        const nomePaciente = getNome(item);
        const nomeProcedimento = getProcedimento(item);

        if (!pacientesAgrupados[nomePaciente]) {
          pacientesAgrupados[nomePaciente] = { 
            ...item, 
            procedimentos_agrupados: [nomeProcedimento],
            ids_agrupados: [item.id] // ✅ Salva o ID inicial numa lista
          };
        } else {
          pacientesAgrupados[nomePaciente].procedimentos_agrupados.push(nomeProcedimento);
          pacientesAgrupados[nomePaciente].ids_agrupados.push(item.id); // ✅ Salva os outros IDs também
          
          if (item.chamado) pacientesAgrupados[nomePaciente].chamado = true;
        }
      });

      const filaOrdenada = Object.values(pacientesAgrupados).sort((a, b) => a.id - b.id);
      setFila(filaOrdenada);
    } catch (error) {
      console.error("Erro ao carregar a fila:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFila();
    const interval = setInterval(carregarFila, 10000); 
    return () => clearInterval(interval);
  }, []);

  //Permite chamar o paciente varias vezes
  const handleChamar = async (idsAgrupados) => {
    try {
      // Chama todos os procedimentos que estão agrupados nessa linha
      for (let i = 0; i < idsAgrupados.length; i++) {
        await atendimentoService.chamarPaciente(idsAgrupados[i]);
      }
      // Recarrega a fila para garantir que o status fique "CHAMADO"
      carregarFila();
    } catch (error) {
      alert('Erro ao chamar paciente. Verifique a conexão.');
    }
  };

  const formatarHorario = (dataIso) => {
    if (!dataIso) return '--:--';
    return new Date(dataIso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getNome = (item) => item.paciente_nome || item.paciente?.nome || 'N/A';
  const getIdade = (item) => item.idade || 'N/A';
  const getProcedimento = (item) => item.procedimento_nome || item.procedimento?.nome || 'CONSULTA';

  return (
    <div className="fila-container">
      <Header />

      <div className="fila-content">
        <div className="fila-card">
          <h3 className="fila-title">FILA DE ATENDIMENTO</h3>
          
          <table className="fila-table">
            <thead>
              <tr>
                <th>HORÁRIO</th>
                <th>NOME</th>
                <th>IDADE</th>
                <th>PROCEDIMENTO</th>
                <th style={{textAlign: 'center'}}>PRIORIDADE</th>
                <th style={{textAlign: 'center'}}>STATUS</th>
                <th style={{textAlign: 'right'}}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{textAlign: 'center'}}>Carregando...</td></tr>
              ) : fila.length === 0 ? (
                <tr><td colSpan="7" style={{textAlign: 'center'}}>Nenhum paciente na fila.</td></tr>
              ) : (
                fila.map((item) => (
                  <tr key={item.id} className={item.chamado ? 'linha-chamada' : ''}>
                    <td style={{fontWeight: 'bold'}}>{formatarHorario(item.criado_em)}</td>
                    <td style={{fontWeight: 'bold', color: '#222'}}>{getNome(item).toUpperCase()}</td>
                    <td style={{fontWeight: 'bold'}}>{getIdade(item)} ANOS</td>
                    
                    <td style={{fontWeight: 'bold', color: '#0056b3'}}>
                      {item.procedimentos_agrupados.join(' + ').toUpperCase()}
                    </td>
                    
                    <td style={{textAlign: 'center'}}>
                      <div className={`prioridade-dot ${item.prioridade?.toLowerCase() || 'normal'}`}></div>
                    </td>
                    
                    <td style={{textAlign: 'center'}}>
                      <span className={`badge-status ${item.chamado ? 'status-chamado' : 'status-aguardando'}`}>
                        {item.chamado ? 'CHAMADO' : 'AGUARDANDO'}
                      </span>
                    </td>

                    <td>
                      <div className="fila-actions">
                        {/* Passa a lista completa de IDs (ids_agrupados) para o clique */}
                        <button 
                          className="btn-fila btn-chamar" 
                          onClick={() => handleChamar(item.ids_agrupados)}
                          title={item.chamado ? "Chamar Novamente" : "Chamar Paciente"}
                        >
                          📢
                        </button>
                        
                        <button 
                          className="btn-fila btn-prontuario" 
                          title="Abrir Prontuário"
                          onClick={() => navigate(`/medico/prontuario/${item.id}`)}
                        >
                          📋
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FilaMedico;