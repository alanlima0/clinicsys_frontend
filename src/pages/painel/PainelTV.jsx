import React, { useState, useEffect, useRef } from 'react';
import atendimentoService from '../../services/atendimentoService';
import './PainelTV.css';

import logoCMBV from '../../assets/logo_cmbv.png'

const PainelTV = () => {
  const [horaAtual, setHoraAtual] = useState('');
  const [chamadoAtual, setChamadoAtual] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [audioAtivo, setAudioAtivo] = useState(false);
  
  const ultimaHoraFalada = useRef(null);
  
 
  const chamadoAtualRef = useRef(null);

  // Relógio
  useEffect(() => {
    const timer = setInterval(() => {
      setHoraAtual(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Chama a voz
  const anunciarNoPainel = (nome, consultorio) => {
    if (!audioAtivo) return;
    
    const texto = `${nome}, dirija-se ao ${consultorio}`;
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    fala.rate = 0.65;
    fala.pitch = 1;
    speechSynthesis.speak(fala);
  };

  // Busca na API a cada 3 segundos
  useEffect(() => {
    const buscarChamado = async () => {
      try {
        const dados = await atendimentoService.obterUltimoChamado();
        
        if (dados && dados.id && dados.hora_chamada !== ultimaHoraFalada.current) {
          
          const nomeP = dados.paciente_nome || dados.paciente?.nome || 'N/A';
          const localP = dados.consultorio || 'CONSULTÓRIO 1';
          const novoChamado = { ...dados, nome_exibicao: nomeP, local_exibicao: localP };

          const prevAtual = chamadoAtualRef.current;
          
          // Se houver um paciente anterior e ele for diferente do novo que chegou:
          if (prevAtual && prevAtual.id !== dados.id) {
            setHistorico(prevHist => {
              //se o paciente já estiver no topo, não duplica
              if (prevHist.length > 0 && prevHist[0].id === prevAtual.id) {
                return prevHist;
              }
              return [prevAtual, ...prevHist].slice(0, 4);
            });
          }

          // Atualiza a tela (estado) e a referência escondida
          setChamadoAtual(novoChamado);
          chamadoAtualRef.current = novoChamado;

          // Toca o áudio de novo e guarda a nova hora do clique
          anunciarNoPainel(nomeP, localP);
          ultimaHoraFalada.current = dados.hora_chamada;
        }
      } catch (error) {
        console.error("Erro ao atualizar painel da TV:", error);
      }
    };

    if (audioAtivo) {
      buscarChamado();
      const pollTimer = setInterval(buscarChamado, 3000);
      return () => clearInterval(pollTimer);
    }
  }, [audioAtivo]);

  if (!audioAtivo) {
    return (
      <div className="tv-iniciar-container">
        <button className="btn-iniciar-tv" onClick={() => setAudioAtivo(true)}>
          ▶ INICIAR PAINEL DA TV
        </button>
      </div>
    );
  }

  return (
    <div className="tv-container">
      <header className="tv-header">
        <div className="tv-logo">
            <img src={logoCMBV} alt="Logo ClinicSys" className="logo-img" />
        </div>
        <div className="tv-relogio">{horaAtual}</div>
      </header>

      <div className="tv-body">
        <div className="tv-card-principal">
          <div className="tv-label">PACIENTE</div>
          <div className="tv-nome-destaque">
            {chamadoAtual ? chamadoAtual.nome_exibicao.toUpperCase() : 'AGUARDANDO...'}
          </div>

          <div className="tv-label" style={{ marginTop: '50px' }}>DIRIJA-SE</div>
          <div className="tv-local-destaque">
            {chamadoAtual ? chamadoAtual.local_exibicao.toUpperCase() : '-'}
          </div>
        </div>

        <div className="tv-sidebar">
          <div className="tv-sidebar-header">HISTÓRICO DE CHAMADAS</div>
          <div className="tv-sidebar-list">
            {historico.length === 0 && <div style={{padding: '20px', color: '#888', textAlign: 'center'}}>Vazio</div>}
            
            {historico.map((item, index) => (
              <div key={item.id + '-' + index} className="tv-hist-item">
                {item.nome_exibicao.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainelTV;