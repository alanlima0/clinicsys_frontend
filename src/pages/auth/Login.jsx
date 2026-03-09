import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './Login.css';

import logoClinicSys from '../../assets/logo_clinicsys.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      await authService.login(email, senha);
      const userData = await authService.getUserData();
      redirectBasedOnUserType(userData.tipo_usuario);
    } catch (error) {
      setErro(error.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  const redirectBasedOnUserType = (tipoUsuario) => {
    const tipo = tipoUsuario?.toLowerCase();

    const routes = {
      admin: '/admin/dashboard',
      medico: '/medico/dashboard',
      recepcao: '/recepcionista/dashboard',
    };

    navigate(routes[tipo] || '/login', { replace: true });
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="login-header">
          <div className="logo">
            <img src={logoClinicSys} alt="Logo ClinicSys" className="logo-img" />
          </div>
        </div>

        <div className="login-content">
          <h1>Bem-vindo(a) ao ClinicSys</h1>
          <p className="subtitle">Entre com as suas credenciais</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                placeholder="Usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {erro && (
              <div className="error-message">
                {erro}
              </div>
            )}

            <div className="form-footer">
              <p className="terms-text">
                Ao acessar esta conta, você concorda com a{' '}
                <a href="/privacidade">Política de Privacidade</a>.
              </p>
            </div>

            <button
              type="submit"
              className="btn-entrar"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;
