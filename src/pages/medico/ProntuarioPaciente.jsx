import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import prontuarioPacienteService from '../../services/prontuarioPacienteService';
import Header from '../../components/HeaderAdmin';
import './ProntuarioPaciente.css';

const ProntuarioPaciente = () => {
  const { id } = useParams(); //ID DO PACIENTE
  const navigate = useNavigate();

  // Estados Base
  const [paciente, setPaciente] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado de Visualização do Histórico Selecionado
  const [idAtendimentoSelecionado, setIdAtendimentoSelecionado] = useState(null);
  const [atendimentoExibicao, setAtendimentoExibicao] = useState(null);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);

  // Textos dos campos da tela principal
  const [queixaPrincipal, setQueixaPrincipal] = useState(''); 
  const [prescricao, setPrescricao] = useState('');

  // Estados para avisos e modais
  const [feedback, setFeedback] = useState({ tipo: '', mensagem: '' });
  const [modalConfirma, setModalConfirma] = useState(false);

  useEffect(() => {
    carregarDadosBase();
  }, [id]);

  useEffect(() => {
    if (idAtendimentoSelecionado) {
      carregarDetalhesDoAtendimento(idAtendimentoSelecionado);
    }
  }, [idAtendimentoSelecionado]);

  const carregarDadosBase = async () => {
    try {
      setLoading(true);
      
      // 1. Busca os dados do paciente
      const dadosPaciente = await prontuarioPacienteService.obterPaciente(id);
      setPaciente(dadosPaciente);

      // 2. Busca o histórico de atendimentos desse paciente
      const dadosHistorico = await prontuarioPacienteService.obterHistorico(id);
      const listaHistorico = dadosHistorico.results || dadosHistorico || [];
      setHistorico(listaHistorico);

      // Se houver histórico, seleciona automaticamente o primeiro (mais recente)
      if (listaHistorico.length > 0) {
        setIdAtendimentoSelecionado(listaHistorico[0].id);
      }

    } catch (error) {
      console.error("Erro ao carregar base do paciente", error);
      mostrarFeedback('erro', 'Erro ao carregar os dados do paciente.');
    } finally {
      setLoading(false);
    }
  };

  const carregarDetalhesDoAtendimento = async (idAtendimento) => {
    try {
      setLoadingDetalhes(true);
      setQueixaPrincipal('');
      setPrescricao('');

      const dadosProntuario = await prontuarioPacienteService.obterDetalhesAtendimento(idAtendimento);
      setAtendimentoExibicao(dadosProntuario);

      const dadosAnamnese = await prontuarioPacienteService.obterAnamnese(idAtendimento);
      if (dadosAnamnese) setQueixaPrincipal(dadosAnamnese.queixa_principal || '');

      const dadosPrescricao = await prontuarioPacienteService.obterPrescricoes(idAtendimento);
      if (dadosPrescricao && dadosPrescricao.length > 0) {
        setPrescricao(dadosPrescricao[0].descricao || '');
      }
    } catch (error) {
      console.error(`Erro ao carregar detalhes do atendimento ${idAtendimento}`, error);
    } finally {
      setLoadingDetalhes(false);
    }
  };

  const calcularIMC = (peso, altura) => {
    if (!peso || !altura) return '--';
    const alturaMetros = altura > 3 ? altura / 100 : altura;
    const imc = peso / (alturaMetros * alturaMetros);
    return imc.toFixed(1);
  };

  const formatarData = (dataNasc) => {
    if (!dataNasc) return '--/--/----';
    const dataCorrigida = new Date(dataNasc.split('T')[0] + 'T12:00:00');
    return dataCorrigida.toLocaleDateString('pt-BR');
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

  const mostrarFeedback = (tipo, mensagem) => {
    setFeedback({ tipo, mensagem });
    setTimeout(() => setFeedback({ tipo: '', mensagem: '' }), 3000);
  };

  const executarSalvarHistorico = async () => {
    setModalConfirma(false);
    
    try {
      if (queixaPrincipal.trim()) {
        await prontuarioPacienteService.salvarAnamnese(idAtendimentoSelecionado, { queixa_principal: queixaPrincipal });
      }
      if (prescricao.trim()) {
        await prontuarioPacienteService.salvarPrescricao(idAtendimentoSelecionado, { descricao: prescricao });
      }
      mostrarFeedback('sucesso', 'Edições salvas no histórico com sucesso!');
    } catch (error) {
      mostrarFeedback('erro', `Erro: ${error.message}`);
    }
  };

  if (loading || !paciente) return <div className="loading-screen">A carregar perfil do paciente...</div>;

  const triagem = atendimentoExibicao?.triagem || {};

  return (
    <div className="prontuario-page">
      <Header />

      {feedback.mensagem && (
        <div className={`feedback-toast ${feedback.tipo}`}>
          {feedback.mensagem}
        </div>
      )}

      {modalConfirma && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmação</h3>
            <p>Tem certeza que deseja salvar as edições neste histórico médico?</p>
            <div className="modal-actions">
              <button className="btn-modal-cancelar" onClick={() => setModalConfirma(false)}>Cancelar</button>
              <button className="btn-modal-confirmar" onClick={executarSalvarHistorico}>Sim, Salvar</button>
            </div>
          </div>
        </div>
      )}

      <div className="prontuario-topbar">
        <div className="topbar-left blue-theme">
          <button className="btn-voltar" onClick={() => navigate(-1)}>
            ◀ VOLTAR
          </button>
        </div>
        <div className="topbar-right">
          <h2>{paciente.nome?.toUpperCase() || 'PACIENTE N/A'}</h2>
          <p> 
            {` NASC: ${formatarData(paciente.data_nascimento)}   |   IDADE: ${calcularIdade(paciente.data_nascimento)} ANOS   |   ALTURA: ${paciente.altura || '--'} CM`}
          </p>
        </div>
      </div>

      <div className="prontuario-body">
        
        <aside className="prontuario-sidebar">
          <div className="sidebar-header">Histórico Clínico ({historico.length})</div>
          <ul className="historico-list">
            {historico.length === 0 ? (
              <li className="historico-item" style={{textAlign: 'center', color: '#999'}}>Nenhum atendimento registado.</li>
            ) : (
              historico.map((hist) => (
                <li 
                  key={hist.id} 
                  className={`historico-item ${idAtendimentoSelecionado == hist.id ? 'active' : ''}`}
                  onClick={() => setIdAtendimentoSelecionado(hist.id)}
                >
                  <strong>{hist.procedimento_nome || hist.procedimento?.nome || 'Consulta'}</strong>
                  <span>{new Date(hist.criado_em || hist.data_criacao).toLocaleDateString('pt-BR')}</span>
                  <span className="status-label">{hist.finalizado ? '✓ Concluído' : 'Em andamento'}</span>
                </li>
              ))
            )}
          </ul>
        </aside>

        <main className="prontuario-main">
          {historico.length === 0 ? (
            <div className="empty-state">
              <h3>Este paciente ainda não possui histórico médico.</h3>
              <p>Os registros aparecerão aqui assim que o paciente for atendido através da Fila de Espera.</p>
            </div>
          ) : loadingDetalhes ? (
            <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>A carregar detalhes do atendimento...</div>
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
                className="btn-salvar-historico" 
                onClick={() => setModalConfirma(true)}
              >
                Salvar Alterações
              </button>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProntuarioPaciente;