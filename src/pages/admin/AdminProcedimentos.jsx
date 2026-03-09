import React, { useState, useEffect } from 'react';
import HeaderAdmin from '../../components/HeaderAdmin';
import SidebarAdmin from '../../components/SidebarAdmin';
import './AdminDashboard.css';
import './AdminProcedimentos.css'; 

import adminProcedimentosService from '../../services/adminProcedimentosService';

const AdminProcedimentos = () => {
  const [procedimentos, setProcedimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para a paginação e BUSCA
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [termoBusca, setTermoBusca] = useState(''); 

  // Estado para os campos do formulário
  const estadoInicialForm = {
    nome: '',
    valor: ''
  };
  const [novoProcedimento, setNovoProcedimento] = useState(estadoInicialForm);
  
  // Estado para controlar se estamos a criar ou a editar (guarda o ID)
  const [editandoId, setEditandoId] = useState(null);

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

  // 1. CARREGAR PROCEDIMENTOS COM PAGINAÇÃO E BUSCA ✅
  const carregarProcedimentos = async (pagina = 1, busca = termoBusca) => {
    try {
      setLoading(true);
      // Passamos a busca para o service
      const data = await adminProcedimentosService.listarProcedimentos(pagina, busca);
      
      const lista = data.results || data || [];
      setProcedimentos(lista);

      // Lógica de cálculo da paginação
      if (data.count !== undefined) {
        const PAGE_SIZE = 10; 
        setTotalPages(Math.ceil(data.count / PAGE_SIZE));
        setHasNext(!!data.next);
        setHasPrev(!!data.previous);
        setCurrentPage(pagina);
      }

    } catch (error) {
      console.error("Erro ao carregar procedimentos:", error);
      mostrarMensagem('Erro ao carregar a lista de procedimentos.', 'erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProcedimentos();
  }, []);

  // Função disparada ao submeter o formulário de busca
  const handleBusca = (e) => {
    e.preventDefault();
    carregarProcedimentos(1, termoBusca); // Volta para a página 1 ao buscar
  };

  // Função para limpar a busca
  const handleLimparBusca = () => {
    setTermoBusca('');
    carregarProcedimentos(1, '');
  };

  // Função para mudar de página
  const irParaPagina = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= totalPages) {
      carregarProcedimentos(novaPagina);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoProcedimento(prev => ({ ...prev, [name]: value }));
  };

  // 2. CRIAR OU ATUALIZAR
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    try {
      const payload = { ...novoProcedimento };

      if (editandoId) {
        await adminProcedimentosService.atualizarProcedimento(editandoId, payload);
        mostrarMensagem('Procedimento atualizado com sucesso!', 'sucesso');
      } else {
        await adminProcedimentosService.criarProcedimento(payload);
        mostrarMensagem('Procedimento criado com sucesso!', 'sucesso');
      }
      
      cancelarEdicao();
      carregarProcedimentos(currentPage);
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
      mostrarMensagem('Erro ao salvar procedimento. Verifique os dados.', 'erro');
    }
  };

  // 3. PREPARAR PARA EDIÇÃO
  const iniciarEdicao = (proc) => {
    setEditandoId(proc.id);
    setNovoProcedimento({
      nome: proc.nome || '',
      valor: proc.valor || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setNovoProcedimento(estadoInicialForm);
  };

  // 4. PREPARAR PARA DELETAR
  const abrirModalDeletar = (id, nome) => {
    setConfirmDelete({ show: true, id, nome });
  };

  const executarDeletar = async () => {
    try {
      await adminProcedimentosService.deletarProcedimento(confirmDelete.id);
      mostrarMensagem('Procedimento removido com sucesso!', 'sucesso');
      setConfirmDelete({ show: false, id: null, nome: '' });
      
      if (editandoId === confirmDelete.id) {
        cancelarEdicao();
      }
      
      let paginaParaCarregar = currentPage;
      if (procedimentos.length === 1 && currentPage > 1) {
        paginaParaCarregar = currentPage - 1;
      }
      carregarProcedimentos(paginaParaCarregar);

    } catch (error) {
      console.error(error);
      mostrarMensagem('Erro ao apagar procedimento.', 'erro');
      setConfirmDelete({ show: false, id: null, nome: '' });
    }
  };

  const formatarMoeda = (valor) => {
    const num = Number(valor);
    if (isNaN(num)) return valor;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="admin-container">
      <HeaderAdmin title="Cadastro de Procedimentos" />
      
      {feedback.texto && (
        <div className={`toast-msg ${feedback.tipo}`}>
          {feedback.texto}
        </div>
      )}

      {confirmDelete.show && (
        <div className="modal-overlay">
          <div className="confirm-modal admin-panel-card">
            <h3 style={{ color: '#e53935', marginTop: 0 }}>⚠️ Confirmar Exclusão</h3>
            <p className="confirm-text">
              Tem certeza que deseja remover o procedimento <strong>{confirmDelete.nome}</strong>?<br/>
              Esta ação não poderá ser desfeita.
            </p>
            <div className="confirm-actions">
              <button className="btn-cancel-modal" onClick={() => setConfirmDelete({ show: false, id: null, nome: '' })}>CANCELAR</button>
              <button className="btn-confirm-del" onClick={executarDeletar}>SIM, EXCLUIR</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-body">
        <SidebarAdmin />
        <main className="admin-content">
          
          <div className="admin-panel-card">
            <h3 className="panel-title">{editandoId ? 'Editar Procedimento' : 'Novo Procedimento'}</h3>
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Nome do Procedimento</label>
                  <input 
                    type="text" 
                    name="nome"
                    value={novoProcedimento.nome}
                    onChange={handleInputChange}
                    placeholder="Ex: Consulta Clínica" 
                    required 
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Valor (R$)</label>
                  <input 
                    type="number" 
                    name="valor"
                    step="0.01"
                    min="0"
                    value={novoProcedimento.valor}
                    onChange={handleInputChange}
                    placeholder="0.00" 
                    required 
                  />
                </div>
              </div>
              <div className="form-actions text-right mt-10" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {editandoId && (
                  <button type="button" className="btn-cancel-form" onClick={cancelarEdicao}>
                    Cancelar
                  </button>
                )}
                <button type="submit" className="btn-save-green">
                  {editandoId ? 'Atualizar Procedimento' : 'Salvar Procedimento'}
                </button>
              </div>
            </form>
          </div>

          <div className="admin-panel-card mt-20">
            {/*CABEÇALHO DA TABELA COM A BARRA DE BUSCA */}
            <div className="panel-header-flex">
              <h3 className="panel-title mb-0">Procedimentos Cadastrados</h3>
              <form className="search-bar" onSubmit={handleBusca}>
                <input 
                  type="text" 
                  placeholder="Buscar procedimento..." 
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                />
                <button type="submit" className="btn-search">Buscar</button>
                {termoBusca && (
                  <button type="button" className="btn-clear" onClick={handleLimparBusca}>✖ Limpar</button>
                )}
              </form>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome do Procedimento</th>
                  <th>Valor</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>Carregando procedimentos...</td>
                  </tr>
                ) : procedimentos.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                      {termoBusca ? 'Nenhum procedimento encontrado para esta busca.' : 'Nenhum procedimento encontrado.'}
                    </td>
                  </tr>
                ) : (
                  procedimentos.map(proc => (
                    <tr key={proc.id}>
                      <td>{proc.nome}</td> 
                      <td style={{ fontWeight: '500' }}>{formatarMoeda(proc.valor)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="btn-icon text-green" 
                          title="Editar"
                          onClick={() => iniciarEdicao(proc)}
                        >
                          📝
                        </button>
                        <button 
                          className="btn-icon text-red" 
                          title="Excluir"
                          onClick={() => abrirModalDeletar(proc.id, proc.nome)}
                          style={{ marginLeft: '10px' }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* CONTROLOS DE PAGINAÇÃO */}
            {!loading && totalPages > 1 && (
              <div className="pagination-container">
                <button 
                  className="btn-page" 
                  disabled={!hasPrev} 
                  onClick={() => irParaPagina(currentPage - 1)}
                >
                  &laquo; Anterior
                </button>
                
                <span className="page-info">
                  Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                </span>
                
                <button 
                  className="btn-page" 
                  disabled={!hasNext} 
                  onClick={() => irParaPagina(currentPage + 1)}
                >
                  Próxima &raquo;
                </button>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminProcedimentos;