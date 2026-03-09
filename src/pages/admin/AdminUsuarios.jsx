import React, { useState, useEffect } from 'react';
import HeaderAdmin from '../../components/HeaderAdmin';
import SidebarAdmin from '../../components/SidebarAdmin';
import './AdminDashboard.css';
import './AdminUsuarios.css'; 

import adminUsuariosService from '../../services/adminUsuariosService';

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const estadoInicialForm = {
    nome: '',
    email: '',
    password: '',
    tipo_usuario: 'RECEPCAO' 
  };
  const [novoUsuario, setNovoUsuario] = useState(estadoInicialForm);
  
  const [editandoId, setEditandoId] = useState(null);
  const [feedback, setFeedback] = useState({ texto: '', tipo: '' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, nome: '' });

  const mostrarMensagem = (texto, tipo) => {
    setFeedback({ texto, tipo });
    setTimeout(() => {
      setFeedback({ texto: '', tipo: '' });
    }, 3000);
  };

  const carregarUsuarios = async (pagina = 1) => {
    try {
      setLoading(true);
      const data = await adminUsuariosService.listarUsuarios(pagina);
      const lista = data.results || data || [];
      setUsuarios(lista);
    } catch (error) {
      console.error("Erro ao carregar utilizadores:", error);
      mostrarMensagem('Erro ao carregar a lista de usuários.', 'erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoUsuario(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    try {
      const payload = { ...novoUsuario };

      if (editandoId && !payload.password) {
        delete payload.password;
      }

      if (editandoId) {
        await adminUsuariosService.atualizarUsuario(editandoId, payload);
        mostrarMensagem('Usuário atualizado com sucesso!', 'sucesso');
      } else {
        await adminUsuariosService.criarUsuario(payload);
        mostrarMensagem('Usuário criado com sucesso!', 'sucesso');
      }
      
      cancelarEdicao();
      carregarUsuarios();
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
      mostrarMensagem('Erro ao salvar usuário. Verifique os dados.', 'erro');
    }
  };

  const iniciarEdicao = (user) => {
    setEditandoId(user.id);
    setNovoUsuario({
      nome: user.nome || user.username || '',
      email: user.email || '',
      password: '',
      tipo_usuario: user.tipo_usuario || user.tipo || 'RECEPCAO' 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setNovoUsuario(estadoInicialForm);
  };

  const abrirModalDeletar = (id, nome) => {
    setConfirmDelete({ show: true, id, nome });
  };

  const executarDeletar = async () => {
    try {
      await adminUsuariosService.deletarUsuario(confirmDelete.id);
      mostrarMensagem('Usuário removido com sucesso!', 'sucesso');
      setConfirmDelete({ show: false, id: null, nome: '' });
      
      if (editandoId === confirmDelete.id) {
        cancelarEdicao();
      }
      
      carregarUsuarios();
    } catch (error) {
      console.error(error);
      mostrarMensagem('Erro ao apagar usuário.', 'erro');
      setConfirmDelete({ show: false, id: null, nome: '' });
    }
  };

  return (
    <div className="admin-container">
      <HeaderAdmin title="Cadastro de Usuários" />
      
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
              Tem certeza que deseja remover o usuário <strong>{confirmDelete.nome}</strong>?<br/>
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
            <h3 className="panel-title">{editandoId ? 'Editar Usuário' : 'Novo Usuário'}</h3>
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Nome</label>
                  <input 
                    type="text" 
                    name="nome"
                    value={novoUsuario.nome}
                    onChange={handleInputChange}
                    placeholder="Nome completo" 
                    required 
                  />
                </div>
                <div className="form-group flex-2">
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={novoUsuario.email}
                    onChange={handleInputChange}
                    placeholder="Email" 
                    required 
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Senha {editandoId && <small style={{fontWeight: 'normal', color: '#888'}}>(Opcional)</small>}</label>
                  <input 
                    type="password" 
                    name="password"
                    value={novoUsuario.password}
                    onChange={handleInputChange}
                    placeholder={editandoId ? "Nova senha..." : "Senha"} 
                    required={!editandoId} 
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Tipo de Usuário</label>
                  <select name="tipo_usuario" value={novoUsuario.tipo_usuario} onChange={handleInputChange}>
                    <option value="RECEPCAO">Recepção</option>
                    <option value="MEDICO">Médico</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="form-actions text-right mt-10" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {editandoId && (
                  <button type="button" className="btn-cancel-form" onClick={cancelarEdicao}>
                    Cancelar
                  </button>
                )}
                <button type="submit" className="btn-save-green">
                  {editandoId ? 'Atualizar Usuário' : 'Salvar Usuário'}
                </button>
              </div>
            </form>
          </div>

          <div className="admin-panel-card mt-20">
            <h3 className="panel-title">Usuários Cadastrados</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Tipo de Usuário</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Carregando usuários...</td>
                  </tr>
                ) : usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Nenhum usuário encontrado.</td>
                  </tr>
                ) : (
                  usuarios.map(user => (
                    <tr key={user.id}>
                      <td>{user.nome || user.username}</td> 
                      <td>{user.email}</td>
                      <td>{user.tipo_usuario || user.tipo}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="btn-icon text-green" 
                          title="Editar"
                          onClick={() => iniciarEdicao(user)}
                        >
                          📝
                        </button>
                        <button 
                          className="btn-icon text-red" 
                          title="Excluir"
                          onClick={() => abrirModalDeletar(user.id, user.nome || user.username)}
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUsuarios;