import React, { useEffect, useState } from 'react';
import pacienteService from '../../services/pacienteService';
import './DashboardRecepcao.css';

import Header from '../../components/Header';

const DashboardRecepcao = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  // Estados para Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Estados para o Modal Principal (Criar/Editar)
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  
  // Estado para o Modal de Confirmação de Exclusão
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, nome: '' });

  // Estados para a Fila de Atendimento
  const [showFilaModal, setShowFilaModal] = useState(false);
  const [pacienteFila, setPacienteFila] = useState(null);
  const [listaProcedimentos, setListaProcedimentos] = useState([]);
  
  // Estado para a busca de procedimentos dentro do modal
  const [buscaProcedimento, setBuscaProcedimento] = useState('');

  const [formFila, setFormFila] = useState({
    procedimentosSelecionados: [],
    prioridade: 'NORMAL',
    forma_pagamento: 'DINHEIRO'
  });

  // Estados para o Modal de Visualização (Olho)
  const [showViewModal, setShowViewModal] = useState(false);
  const [pacienteView, setPacienteView] = useState(null);
  const [historicoAtendimentos, setHistoricoAtendimentos] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  const [novoPaciente, setNovoPaciente] = useState({
    nome: '',
    data_nascimento: '',
    telefone: '',
    sexo: 'M',
    altura: ''
  });

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
      const data = await pacienteService.listarPacientes(pagina, termo);
      setPacientes(data.results || []);
      
      if (data.count) {
        setTotalPaginas(Math.ceil(data.count / 10));
      } else {
        setTotalPaginas(data.next ? pagina + 1 : pagina);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const carregarProcs = async () => {
      try {
        const dados = await pacienteService.listarProcedimentos();
        setListaProcedimentos(dados.results || dados || []); 
      } catch (error) {
        console.error("Erro ao carregar procedimentos:", error);
      }
    };
    carregarProcs();
  }, []);

  useEffect(() => {
    carregarPacientes(paginaAtual, busca);
  }, [paginaAtual]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPaginaAtual(1); 
    carregarPacientes(1, busca);
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setIdEditando(null);
    setNovoPaciente({ nome: '', data_nascimento: '', telefone: '', sexo: 'M', altura: '' });
    setShowModal(true);
  };

  const handleEditClick = (paciente) => {
    setIsEditing(true);
    setIdEditando(paciente.id);
    
    const dataFormatada = paciente.data_nascimento ? paciente.data_nascimento.split('T')[0] : '';
    
    setNovoPaciente({
      nome: paciente.nome || '',
      data_nascimento: dataFormatada,
      telefone: paciente.telefone || '',
      sexo: paciente.sexo || 'M',
      altura: paciente.altura || ''
    });
    
    setShowModal(true);
  };

  const handleDeleteClick = (id, nome) => {
    setConfirmDelete({ show: true, id, nome });
  };

  const executarApagar = async () => {
    try {
      await pacienteService.deletarPaciente(confirmDelete.id);
      mostrarMensagem('Paciente apagado com sucesso!', 'sucesso');
      setConfirmDelete({ show: false, id: null, nome: '' });
      carregarPacientes(paginaAtual, busca);
    } catch (error) {
      console.error(error);
      mostrarMensagem('Erro ao apagar o paciente.', 'erro');
      setConfirmDelete({ show: false, id: null, nome: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...novoPaciente, altura: Number(novoPaciente.altura) };
      
      if (isEditing) {
        await pacienteService.atualizarPaciente(idEditando, payload);
        mostrarMensagem('Paciente atualizado com sucesso!', 'sucesso');
      } else {
        await pacienteService.criarPaciente(payload);
        mostrarMensagem('Paciente adicionado com sucesso!', 'sucesso');
      }
      
      setShowModal(false); 
      carregarPacientes(paginaAtual, busca); 
    } catch (error) {
      console.error(error);
      mostrarMensagem('Erro ao guardar os dados. Tente novamente.', 'erro');
    }
  };

  const handleFilaClick = (paciente) => {
    setPacienteFila(paciente);
    setBuscaProcedimento(''); 
    setFormFila({
      procedimentosSelecionados: [],
      prioridade: 'NORMAL',
      forma_pagamento: 'DINHEIRO'
    });
    setShowFilaModal(true);
  };

  const handleProcedimentoChange = (procId) => {
    setFormFila(prev => {
      const selecionados = prev.procedimentosSelecionados;
      if (selecionados.includes(procId)) {
        return { ...prev, procedimentosSelecionados: selecionados.filter(id => id !== procId) };
      } else {
        return { ...prev, procedimentosSelecionados: [...selecionados, procId] };
      }
    });
  };

  const handleSubmitFila = async (e) => {
    e.preventDefault();
    if (formFila.procedimentosSelecionados.length === 0) {
      mostrarMensagem('Selecione pelo menos um procedimento!', 'erro');
      return;
    }

    try {
      const promessas = formFila.procedimentosSelecionados.map(procId => {
        return pacienteService.criarAtendimento({
          paciente: pacienteFila.id,
          procedimento: procId,
          prioridade: formFila.prioridade,
          forma_pagamento: formFila.forma_pagamento
        });
      });

      await Promise.all(promessas);
      
      mostrarMensagem('Paciente enviado para a fila com sucesso!', 'sucesso');
      setShowFilaModal(false);
    } catch (error) {
      console.error(error);
      mostrarMensagem('Erro ao adicionar à fila. Verifique os dados.', 'erro');
    }
  };

  const handleViewClick = async (paciente) => {
    setPacienteView(paciente);
    setShowViewModal(true);
    setLoadingHistorico(true);
    setHistoricoAtendimentos([]); 

    try {
      const dados = await pacienteService.listarAtendimentosPorPaciente(paciente.id);

      const listaHistorico = dados.results || dados || [];
      setHistoricoAtendimentos(listaHistorico);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      mostrarMensagem('Erro ao carregar o histórico de atendimentos.', 'erro');
    } finally {
      setLoadingHistorico(false);
    }
  };

  const procedimentosFiltrados = listaProcedimentos.filter(proc =>
    proc.nome.toLowerCase().includes(buscaProcedimento.toLowerCase())
  );

  return (
    <div className="container">
      <Header />

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
              Tem a certeza que deseja apagar o paciente <strong>{confirmDelete.nome}</strong>?<br/>
              Esta ação não pode ser desfeita.
            </p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setConfirmDelete({ show: false, id: null, nome: '' })}>CANCELAR</button>
              <button className="btn-confirm-del" onClick={executarApagar}>SIM, APAGAR</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro/Edição de Paciente */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? 'EDITAR PACIENTE' : 'NOVO PACIENTE'}</h3>
              <button className="btn-close-x" onClick={() => setShowModal(false)}>X</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>NOME COMPLETO</label>
                <input type="text" required value={novoPaciente.nome} onChange={(e) => setNovoPaciente({...novoPaciente, nome: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>DATA NASCIMENTO</label>
                  <input type="date" required value={novoPaciente.data_nascimento} onChange={(e) => setNovoPaciente({...novoPaciente, data_nascimento: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>SEXO</label>
                  <select value={novoPaciente.sexo} onChange={(e) => setNovoPaciente({...novoPaciente, sexo: e.target.value})}>
                    <option value="M">MASCULINO</option>
                    <option value="F">FEMININO</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>TELEFONE</label>
                  <input type="text" placeholder="(88) 99999-9999" value={novoPaciente.telefone} onChange={(e) => setNovoPaciente({...novoPaciente, telefone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>ALTURA (cm)</label>
                  <input type="number" placeholder="170" value={novoPaciente.altura} onChange={(e) => setNovoPaciente({...novoPaciente, altura: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn-save">
                {isEditing ? 'GUARDAR ALTERAÇÕES' : 'SALVAR CADASTRO'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Adicionar à Fila */}
      {showFilaModal && pacienteFila && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>ADICIONAR À FILA DE ATENDIMENTO</h3>
              <button className="btn-close-x" onClick={() => setShowFilaModal(false)}>X</button>
            </div>
            
            <div className="paciente-info-banner">
              <div><strong>NOME:</strong> {pacienteFila.nome.toUpperCase()}</div>
              <div><strong>IDADE:</strong> {calcularIdade(pacienteFila.data_nascimento)} ANOS</div>
              <div><strong>SEXO:</strong> {pacienteFila.sexo === 'M' ? 'MASCULINO' : 'FEMININO'}</div>
            </div>

            <form onSubmit={handleSubmitFila}>
              <div className="form-group">
                <label>PROCEDIMENTOS (Selecione 1 ou mais)</label>
                
                <input 
                  type="text" 
                  placeholder="Buscar procedimento..." 
                  value={buscaProcedimento}
                  onChange={(e) => setBuscaProcedimento(e.target.value)}
                  style={{ marginBottom: '8px' }}
                />

                <div className="checkbox-list">
                  {listaProcedimentos.length === 0 ? (
                    <span style={{fontSize: '13px', color: '#888'}}>A carregar procedimentos...</span>
                  ) : procedimentosFiltrados.length === 0 ? (
                    <span style={{fontSize: '13px', color: '#888'}}>Nenhum procedimento encontrado.</span>
                  ) : (
                    procedimentosFiltrados.map(proc => (
                      <label key={proc.id} className="checkbox-item">
                        <input 
                          type="checkbox" 
                          checked={formFila.procedimentosSelecionados.includes(proc.id)}
                          onChange={() => handleProcedimentoChange(proc.id)}
                        />
                        {proc.nome}
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>PRIORIDADE</label>
                  <select 
                    value={formFila.prioridade} 
                    onChange={(e) => setFormFila({...formFila, prioridade: e.target.value})}
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="PREFERENCIAL">PREFERENCIAL</option>
                    <option value="URGENTE">URGENTE</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>FORMA DE PAGAMENTO</label>
                  <select 
                    value={formFila.forma_pagamento} 
                    onChange={(e) => setFormFila({...formFila, forma_pagamento: e.target.value})}
                  >
                    <option value="DINHEIRO">DINHEIRO</option>
                    <option value="CARTAO">CARTÃO</option>
                    <option value="PIX">PIX</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-save">ENVIAR PARA A FILA</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização (Informações e Histórico) */}
      {showViewModal && pacienteView && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>INFORMAÇÕES DO PACIENTE</h3>
              <button className="btn-close-x" onClick={() => setShowViewModal(false)}>X</button>
            </div>

            <div className="paciente-info-banner" style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
              <div><strong>NOME:</strong> {pacienteView.nome.toUpperCase()}</div>
              <div><strong>DATA NASC.:</strong> {formatarData(pacienteView.data_nascimento)} ({calcularIdade(pacienteView.data_nascimento)} ANOS)</div>
              <div><strong>SEXO:</strong> {pacienteView.sexo === 'M' ? 'MASCULINO' : 'FEMININO'}</div>
              <div><strong>TELEFONE:</strong> {pacienteView.telefone || '--'}</div>
              <div><strong>ALTURA:</strong> {pacienteView.altura ? `${pacienteView.altura} cm` : '--'}</div>
            </div>

            <div className="historico-section" style={{ marginTop: '20px' }}>
              <h4 style={{ marginBottom: '10px', color: '#555' }}>HISTÓRICO DE ATENDIMENTOS</h4>
              
              {loadingHistorico ? (
                <p style={{ fontSize: '14px', color: '#888' }}>A carregar histórico...</p>
              ) : historicoAtendimentos.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#888' }}>Nenhum atendimento registado para este paciente.</p>
              ) : (
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  <table className="pacientes-table">
                    <thead>
                      <tr>
                        <th>DATA</th>
                        <th>PROCEDIMENTO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoAtendimentos.map((atendimento, index) => (
                        <tr key={atendimento.id || index}>
                          <td>
                            {atendimento.criado_em 
                              ? new Date(atendimento.criado_em).toLocaleDateString('pt-BR') 
                              : formatarData(atendimento.data_criacao || atendimento.data_atendimento)}
                          </td>
                          
                          <td>
                            <strong>{atendimento.procedimento_nome || atendimento.procedimento?.nome || 'Consulta'}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Componentes de Interface Principal */}
      <div className="card">
        <h3>BUSCAR PACIENTE</h3>
        <form onSubmit={handleSearch} className="search-box">
          <input 
            type="text" 
            placeholder="Nome do Paciente" 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button type="submit" className="btn-search">BUSCAR</button>
        </form>
      </div>

      <div className="card">
        <div className="header-lista">
          <h3>LISTA DE PACIENTES</h3>
          <button className="btn-add" onClick={handleAddClick}>+ ADICIONAR PACIENTE</button>
        </div>

        <table className="pacientes-table">
          <thead>
            <tr>
              <th>DATA DE CADASTRO</th>
              <th>NOME</th>
              <th>DATA DE NASCIMENTO</th>
              <th>SEXO</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5">A carregar...</td></tr>
            ) : pacientes.length === 0 ? (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>Nenhum paciente encontrado.</td></tr>
            ) : (
              pacientes.map(p => (
                <tr key={p.id}>
                  <td>{formatarData(p.data_cadastro)}</td>
                  <td>{p.nome.toUpperCase()}</td>
                  <td>{formatarData(p.data_nascimento)}</td>
                  <td>{p.sexo === 'M' ? 'MASCULINO' : 'FEMININO'}</td>
                  <td>
                    <div className="actions">
                      <button className="btn-action add" onClick={() => handleFilaClick(p)}>+</button>
                      <button className="btn-action view" onClick={() => handleEditClick(p)}>✏️</button>
                      <button className="btn-action del" onClick={() => handleDeleteClick(p.id, p.nome)}>🗑️</button>
                      <button className="btn-action view" onClick={() => handleViewClick(p)}>👁️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

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

export default DashboardRecepcao;