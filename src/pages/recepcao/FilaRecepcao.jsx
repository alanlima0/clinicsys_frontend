import React, { useEffect, useState } from 'react';
import filaRecepcaoService from '../../services/filaRecepcaoService';
import Header from '../../components/Header';
import './FilaRecepcao.css';

const FilaRecepcao = () => {
  const [atendimentos, setAtendimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para o Modal de Triagem
  const [showTriagemModal, setShowTriagemModal] = useState(false);
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState(null);
  
  const [formTriagem, setFormTriagem] = useState({
    peso: '',
    pressao_arterial: '',
    temperatura: '',
    saturacao: '',
    frequencia_cardiaca: '',
    glicemia: ''
  });

  // Estado para mensagens flutuantes (Toast)
  const [feedback, setFeedback] = useState({ texto: '', tipo: '' });

  // Estado para o modal de confirmação de exclusão
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, nome: '' });

  const mostrarMensagem = (texto, tipo) => {
    setFeedback({ texto, tipo });
    setTimeout(() => {
      setFeedback({ texto: '', tipo: '' });
    }, 3000);
  };

  const carregarFila = async () => {
    try {
      setLoading(true);
      const data = await filaRecepcaoService.listarFilaAtendimento();
      
      const lista = data.results || data || []; 
      
      // Filtra os que NÃO estão finalizados
      const filaAtiva = lista.filter(item => item.finalizado !== true);
      
      setAtendimentos(filaAtiva);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFila();
  }, []);

  const formatarHorario = (isoString) => {
    if (!isoString) return '--:--';
    const data = new Date(isoString);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getCorPrioridade = (prioridade) => {
    switch (prioridade?.toUpperCase()) {
      case 'URGENTE': return '#e57373'; 
      case 'PREFERENCIAL': return '#ffd54f'; 
      case 'NORMAL':
      default: return '#00d233'; 
    }
  };

  const abrirTriagem = (atendimento) => {
    setAtendimentoSelecionado(atendimento);
    setFormTriagem({
      peso: '', pressao_arterial: '', temperatura: '', saturacao: '', frequencia_cardiaca: '', glicemia: ''
    });
    setShowTriagemModal(true);
  };

  const handleSalvarTriagem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        atendimento: atendimentoSelecionado.id,
        peso: Number(formTriagem.peso),
        pressao_arterial: formTriagem.pressao_arterial,
        temperatura: Number(formTriagem.temperatura),
        saturacao: Number(formTriagem.saturacao),
        frequencia_cardiaca: Number(formTriagem.frequencia_cardiaca),
        glicemia: formTriagem.glicemia ? Number(formTriagem.glicemia) : null
      };

      await filaRecepcaoService.criarTriagem(payload);
      
      mostrarMensagem('Triagem adicionada com sucesso!', 'sucesso');
      
      setShowTriagemModal(false);
      carregarFila(); 
    } catch (error) {
      console.error(error);
      mostrarMensagem('Erro ao salvar triagem. Verifique os dados.', 'erro');
    }
  };

  const removerDaFila = (id, nome) => {
    setConfirmDelete({ show: true, id, nome });
  };

  const executarRemoverDaFila = async () => {
    try {
      await filaRecepcaoService.deletarAtendimento(confirmDelete.id);
      mostrarMensagem('Paciente removido da fila com sucesso!', 'sucesso');
      setConfirmDelete({ show: false, id: null, nome: '' });
      carregarFila();
    } catch (error) {
      console.error(error);
      mostrarMensagem('Erro ao remover atendimento.', 'erro');
      setConfirmDelete({ show: false, id: null, nome: '' });
    }
  };

  return (
    <div className="container">
      <Header />

      {/* Toast de Notificação */}
      {feedback.texto && (
        <div className={`toast-msg ${feedback.tipo}`}>
          {feedback.texto}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {confirmDelete.show && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <div className="modal-header" style={{ borderBottom: 'none', marginBottom: '10px' }}>
              <h3 style={{ color: '#e57373' }}>⚠️ CONFIRMAR EXCLUSÃO</h3>
            </div>
            <p className="confirm-text">
              Tem a certeza que deseja remover <strong>{confirmDelete.nome}</strong> da fila?<br/>
              Esta ação não pode ser desfeita.
            </p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setConfirmDelete({ show: false, id: null, nome: '' })}>CANCELAR</button>
              <button className="btn-confirm-del" onClick={executarRemoverDaFila}>SIM, REMOVER</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Triagem */}
      {showTriagemModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>ADICIONAR TRIAGEM</h3>
              <button className="btn-close-x" onClick={() => setShowTriagemModal(false)}>X</button>
            </div>
            
            <div className="paciente-info-banner">
              <strong>Paciente:</strong> {atendimentoSelecionado?.paciente_nome}
            </div>

            <form onSubmit={handleSalvarTriagem}>
              <div className="form-row">
                <div className="form-group">
                  <label>PESO (kg)</label>
                  <input type="number" step="0.1" required value={formTriagem.peso} onChange={(e) => setFormTriagem({...formTriagem, peso: e.target.value})} placeholder="Ex: 66" />
                </div>
                <div className="form-group">
                  <label>PRESSÃO ARTERIAL</label>
                  <input type="text" required value={formTriagem.pressao_arterial} onChange={(e) => setFormTriagem({...formTriagem, pressao_arterial: e.target.value})} placeholder="Ex: 120x80" />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>TEMPERATURA (°C)</label>
                  <input type="number" step="0.1" required value={formTriagem.temperatura} onChange={(e) => setFormTriagem({...formTriagem, temperatura: e.target.value})} placeholder="Ex: 36.6" />
                </div>
                <div className="form-group">
                  <label>SATURAÇÃO (%)</label>
                  <input type="number" required value={formTriagem.saturacao} onChange={(e) => setFormTriagem({...formTriagem, saturacao: e.target.value})} placeholder="Ex: 99" />
                </div>
              </div>

            
              <div className="form-row">
                <div className="form-group">
                  <label>FREQ. CARDÍACA (bpm)</label>
                  <input type="number" required value={formTriagem.frequencia_cardiaca} onChange={(e) => setFormTriagem({...formTriagem, frequencia_cardiaca: e.target.value})} placeholder="Ex: 66" />
                </div>
                <div className="form-group">
                  <label>GLICEMIA (mg/dL)</label>
                  <input type="number" value={formTriagem.glicemia} onChange={(e) => setFormTriagem({...formTriagem, glicemia: e.target.value})} placeholder="Ex: 95" />
                </div>
              </div>

              <button type="submit" className="btn-save">SALVAR TRIAGEM</button>
            </form>
          </div>
        </div>
      )}

      {/* Conteúdo da Fila */}
      <div className="card">
        <h3 className="titulo-fila">FILA DE ATENDIMENTO</h3>

        <table className="fila-table">
          <thead>
            <tr>
              <th>HORÁRIO</th>
              <th>NOME</th>
              <th>IDADE</th>
              <th>PROCEDIMENTO</th>
              <th style={{ textAlign: 'center' }}>PRIORIDADE</th>
              <th style={{ textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Carregando fila...</td></tr>
            ) : atendimentos.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Nenhum paciente na fila.</td></tr>
            ) : (
              atendimentos.map(item => (
                <tr key={item.id}>
                  <td className="fw-bold">{formatarHorario(item.criado_em)}</td>
                  <td className="fw-bold">{item.paciente_nome?.toUpperCase()}</td>
                  <td className="fw-bold">{item.idade} ANOS</td>
                  <td className="fw-bold">{item.procedimento_nome?.toUpperCase()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div 
                      className="status-circle" 
                      style={{ backgroundColor: getCorPrioridade(item.prioridade) }}
                      title={`Prioridade: ${item.prioridade}`}
                    ></div>
                  </td>
                  <td>
                    <div className="fila-actions">
                      <button className="btn-add-triagem" onClick={() => abrirTriagem(item)}>
                        + ADICIONAR TRIAGEM
                      </button>
                      
                      <button className="btn-del-fila" onClick={() => removerDaFila(item.id, item.paciente_nome)}>
                        🗑️
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
  );
};

export default FilaRecepcao;