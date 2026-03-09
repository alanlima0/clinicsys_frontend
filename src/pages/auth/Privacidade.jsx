import React from 'react';
import { Link } from 'react-router-dom';
import './Documentos.css';

const Privacidade = () => {
  return (
    <div className="documento-container">
      <div className="documento-card">
        <h1>Política de Privacidade e Proteção de Dados - ClinicSys</h1>
        <p className="data-atualizacao">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <p>Esta Política de Privacidade destina-se aos usuários internos do sistema ClinicSys (administradores, médicos e recepcionistas). O objetivo é esclarecer como tratamos os seus dados pessoais e estabelecer as regras para o tratamento dos dados dos pacientes sob nossa custódia, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).</p>

        <h2>1. Seus Dados Pessoais (Usuário do Sistema)</h2>
        <p>Para garantir o seu acesso seguro, o ClinicSys coleta e armazena os seguintes dados seus: E-mail, nome e perfil de acesso.</p>
        <ul>
          <li><strong>Finalidade:</strong> Estes dados são usados exclusivamente para autenticação, controle de acesso e segurança da informação no sistema.</li>
          <li><strong>Privacidade:</strong> Suas credenciais são criptografadas e mantidas em sigilo pela administração da clínica.</li>
        </ul>

        <h2>2. O Tratamento de Dados de Pacientes (Dados Sensíveis)</h2>
        <p>Ao utilizar o ClinicSys, você atua como um preposto da clínica no tratamento de dados de saúde de terceiros. Você compreende que:</p>
        <ul>
          <li><strong>Dados de Saúde são Sensíveis:</strong> Histórico clínico, diagnósticos, receitas, laudos e motivos de agendamento gozam de proteção legal máxima.</li>
          <li><strong>Sigilo Absoluto:</strong> Você tem o dever legal e ético de manter confidencialidade absoluta sobre todas as informações de pacientes acessadas no sistema, não podendo comentá-las fora do ambiente estrito e necessário para o atendimento.</li>
        </ul>

        <h2>3. Princípios Práticos de Privacidade no ClinicSys</h2>
        <p>No uso diário do sistema, você deve observar os seguintes princípios:</p>
        <ul>
          <li><strong>Finalidade e Necessidade:</strong> Colete e acesse apenas os dados indispensáveis para o atendimento ou rotina administrativa do paciente em questão.</li>
          <li><strong>Segurança na Estação de Trabalho:</strong> Bloqueie o computador ou faça <em>logoff</em> do sistema sempre que se ausentar da sua mesa/consultório. Nunca deixe a tela do ClinicSys exposta a pessoas não autorizadas.</li>
        </ul>

        <h2>4. Comunicação de Incidentes</h2>
        <p>Caso você suspeite do comprometimento da sua senha, observe falhas de segurança no sistema ou identifique acessos indevidos a dados de pacientes, você deve comunicar o fato imediatamente ao administrador do sistema ou à gerência da clínica.</p>

        <div className="documento-footer">
          <Link to="/login" className="btn-voltar">Voltar para o Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Privacidade;