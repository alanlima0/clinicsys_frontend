import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import atendimentoService from '../../services/atendimentoService';
import Header from '../../components/HeaderProntuario';
import './ProntuarioMedico.css';

const ProntuarioMedico = () => {
  const { id } = useParams(); // ID do atendimento
  const navigate = useNavigate();

  // Estados Base (Cabeçalho e Fila)
  const [atendimentoBase, setAtendimentoBase] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [totalFila, setTotalFila] = useState(0);

  // Estado de Visualização/Edição
  const [idSelecionado, setIdSelecionado] = useState(id);
  const [atendimentoExibicao, setAtendimentoExibicao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);

  // Textos dos campos da tela principal
  const [queixaPrincipal, setQueixaPrincipal] = useState(''); 
  const [prescricao, setPrescricao] = useState('');

  // Estados para avisos e modais
  const [feedback, setFeedback] = useState({ tipo: '', mensagem: '' });
  const [modalConfirma, setModalConfirma] = useState({ aberto: false, mensagem: '', acao: null });

  useEffect(() => {
    carregarDadosBase();
  }, [id]);

  useEffect(() => {
    if (idSelecionado) {
      carregarDetalhes(idSelecionado);
    }
  }, [idSelecionado]);

  const carregarDadosBase = async () => {
    try {
      setLoading(true);
      const dadosAtendimento = await atendimentoService.obterProntuarioCompleto(id);
      setAtendimentoBase(dadosAtendimento);

      const dadosFila = await atendimentoService.listarFila();
      setTotalFila(dadosFila.length > 0 ? dadosFila.length - 1 : 0);

      const dadosHistorico = await atendimentoService.obterHistoricoPaciente(id);
      setHistorico(dadosHistorico || []);
    } catch (error) {
      console.error("Erro ao carregar base do prontuário", error);
    } finally {
      setLoading(false);
    }
  };

  const carregarDetalhes = async (idAlvo) => {
    try {
      setLoadingDetalhes(true);
      setQueixaPrincipal('');
      setPrescricao('');

      const dadosProntuario = await atendimentoService.obterProntuarioCompleto(idAlvo);
      setAtendimentoExibicao(dadosProntuario);

      const dadosAnamnese = await atendimentoService.obterAnamnese(idAlvo);
      if (dadosAnamnese) setQueixaPrincipal(dadosAnamnese.queixa_principal || '');

      const dadosPrescricao = await atendimentoService.obterPrescricoes(idAlvo);
      if (dadosPrescricao && dadosPrescricao.length > 0) {
        setPrescricao(dadosPrescricao[0].descricao || '');
      }
    } catch (error) {
      console.error(`Erro ao carregar os detalhes do atendimento ${idAlvo}`, error);
    } finally {
      setLoadingDetalhes(false);
    }
  };

  // Calcula o IMC
  const calcularIMC = (peso, altura) => {
    if (!peso || !altura) return '--';
    const alturaMetros = altura > 3 ? altura / 100 : altura;
    const imc = peso / (alturaMetros * alturaMetros);
    return imc.toFixed(1);
  };

  // Formata a data de nascimento 
  const formatarDataNascimento = (dataNasc) => {
    if (!dataNasc) return '--/--/----';
    const dataCorrigida = new Date(dataNasc.split('T')[0] + 'T12:00:00');
    return dataCorrigida.toLocaleDateString('pt-BR');
  };

  // Calcula a Idade a partir da Data de Nascimento
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

  const mostrarFeedback = (tipo, mensagem) => {
    setFeedback({ tipo, mensagem });
    setTimeout(() => setFeedback({ tipo: '', mensagem: '' }), 3000);
  };

  const handleAbrirConfirmacao = () => {
    const isAtendimentoAtual = (idSelecionado == id);
    const acaoConfirmacao = isAtendimentoAtual 
      ? 'Tem certeza que deseja salvar e finalizar este atendimento de hoje?' 
      : 'Tem certeza que deseja salvar as edições neste histórico passado?';

    setModalConfirma({
      aberto: true,
      mensagem: acaoConfirmacao,
      acao: isAtendimentoAtual ? 'FINALIZAR' : 'SALVAR_HISTORICO'
    });
  };

  const executarAcaoConfirmada = async () => {
    setModalConfirma({ aberto: false, mensagem: '', acao: null });
    
    try {
      if (queixaPrincipal.trim()) {
        await atendimentoService.salvarAnamnese(idSelecionado, { queixa_principal: queixaPrincipal });
      }
      if (prescricao.trim()) {
        await atendimentoService.salvarPrescricao(idSelecionado, { descricao: prescricao });
      }

      if (modalConfirma.acao === 'FINALIZAR') {
        await atendimentoService.finalizarAtendimento(id);
        mostrarFeedback('sucesso', 'Atendimento finalizado com sucesso!');
        setTimeout(() => navigate('/medico/dashboard'), 1500);
      } else {
        mostrarFeedback('sucesso', 'Edições do histórico salvas com sucesso!');
      }

    } catch (error) {
      mostrarFeedback('erro', `Erro: ${error.message}`);
    }
  };

  if (loading || !atendimentoBase) return <div className="loading-screen">A inicializar prontuário...</div>;

  const triagem = atendimentoExibicao?.triagem || {};
  const paciente = atendimentoExibicao?.paciente || {};
  const isAtendimentoAtual = (idSelecionado == id);

  return (
    <div className="prontuario-page">
      <Header />

      {feedback.mensagem && (
        <div className={`feedback-toast ${feedback.tipo}`}>
          {feedback.mensagem}
        </div>
      )}

      {modalConfirma.aberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmação</h3>
            <p>{modalConfirma.mensagem}</p>
            <div className="modal-actions">
              <button 
                className="btn-modal-cancelar" 
                onClick={() => setModalConfirma({ aberto: false, mensagem: '', acao: null })}
              >
                Cancelar
              </button>
              <button 
                className="btn-modal-confirmar" 
                onClick={executarAcaoConfirmada}
              >
                Sim, Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="prontuario-topbar">
        <div className="topbar-left">
          <h4>FILA DE ATENDIMENTO</h4>
          <p>{totalFila} Paciente{totalFila !== 1 ? 's' : ''} aguardando</p>
        </div>
        <div className="topbar-right">
          <h2>{atendimentoBase.paciente?.nome?.toUpperCase() || 'PACIENTE N/A'}</h2>
          
          <p> 
            {
              ` NASC: ${formatarDataNascimento(atendimentoBase.paciente.data_nascimento)}   |   IDADE: ${calcularIdade(atendimentoBase.paciente.data_nascimento)} ANOS   |   ALTURA: ${atendimentoBase.paciente.altura} CM`
            }
          </p>
        </div>
      </div>

      <div className="prontuario-body">
        
        <aside className="prontuario-sidebar">
          <div className="sidebar-header">Histórico de Registros ({historico.length})</div>
          <ul className="historico-list">
            {historico.length === 0 ? (
              <li className="historico-item" style={{textAlign: 'center', color: '#999'}}>Nenhum registro.</li>
            ) : (
              historico.map((hist) => (
                <li 
                  key={hist.id} 
                  className={`historico-item ${idSelecionado == hist.id ? 'active' : ''}`}
                  onClick={() => setIdSelecionado(hist.id)}
                >
                  <strong>{hist.procedimento_nome || hist.procedimento?.nome || 'Consulta'}</strong>
                  <span>{new Date(hist.criado_em).toLocaleDateString('pt-BR')}</span>
                </li>
              ))
            )}
          </ul>
        </aside>

        <main className="prontuario-main">
          {loadingDetalhes ? (
            <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>Carregando detalhes do histórico...</div>
          ) : (
            <>
              <h3 className="titulo-consulta">
                {atendimentoExibicao?.procedimento?.nome?.toUpperCase() || 'CONSULTA'} | 
                {' '}{new Date(atendimentoExibicao?.criado_em).toLocaleDateString('pt-BR')}
              </h3>

              <div className="prontuario-card">
                <h4 className="card-title">1. Triagem & Sinais Vitais</h4>
                <div className="sinais-vitais-grid">
                  <div className="vital-item">
                    <label>Pressão Arterial</label>
                    <span>{triagem.pressao_arterial || '--'} mmHg</span>
                  </div>
                  <div className="vital-item">
                    <label>Saturação (SpO2)</label>
                    <span>{triagem.saturacao || '--'} %</span>
                  </div>
                  <div className="vital-item">
                    <label>Frequência Cardíaca</label>
                    <span>{triagem.frequencia_cardiaca || '--'} BPM</span>
                  </div>
                  <div className="vital-item">
                    <label>Peso</label>
                    <span>{triagem.peso ? `${triagem.peso} kg` : '--'}</span>
                  </div>
                  <div className="vital-item">
                    <label>IMC</label>
                    <span>{calcularIMC(triagem.peso, paciente.altura)}</span>
                  </div>
                  <div className="vital-item">
                    <label>Temperatura</label>
                    <span>{triagem.temperatura || '--'} °C</span>
                  </div>
                  <div className="vital-item">
                    <label>Glicemia</label>
                    <span>{triagem.glicemia ? `${triagem.glicemia} mg/dL` : '--'}</span>
                  </div>
                </div>
              </div>

              <div className="prontuario-card">
                <h4 className="card-title">2. Anamnese e Exames</h4>
                <textarea 
                  className="prontuario-textarea"
                  placeholder="Descreva a história clínica, exame físico detalhado..."
                  value={queixaPrincipal}
                  onChange={(e) => setQueixaPrincipal(e.target.value)}
                ></textarea>
              </div>

              <div className="prontuario-card">
                <h4 className="card-title">3. Conduta Terapêutica</h4>
                <div className="form-group">
                  <label>Prescrição Médica</label>
                  <textarea 
                    className="prontuario-textarea"
                    value={prescricao}
                    onChange={(e) => setPrescricao(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <button 
                className="btn-salvar-finalizar" 
                style={{ backgroundColor: isAtendimentoAtual ? '#2196f3' : '#f39c12' }}
                onClick={handleAbrirConfirmacao}
              >
                {isAtendimentoAtual ? 'Salvar e Finalizar Atendimento' : 'Salvar Alterações do Histórico'}
              </button>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProntuarioMedico;