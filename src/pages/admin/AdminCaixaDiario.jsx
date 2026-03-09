import React, { useState, useEffect } from 'react';
import HeaderAdmin from '../../components/HeaderAdmin';
import SidebarAdmin from '../../components/SidebarAdmin';
import './AdminDashboard.css'; 
import './AdminCaixaDiario.css'; 

import adminCaixaService from '../../services/adminCaixaService';

const AdminCaixaDiario = () => {
  const [registros, setRegistros] = useState([]);
  const [totalGeral, setTotalGeral] = useState(0);
  const [totaisForma, setTotaisForma] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarRelatorio = async () => {
    try {
      setLoading(true);
      const data = await adminCaixaService.listarRelatorioCaixa();
      
      setRegistros(data.registros || []);
      setTotalGeral(data.total_geral || 0);
      setTotaisForma(data.totais_por_forma || []);

    } catch (error) {
      console.error("Erro ao carregar o relatório do caixa:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRelatorio();
  }, []);

  const formatarMoeda = (valor) => {
    const num = Number(valor);
    if (isNaN(num)) return valor;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarHora = (dataString) => {
    if (!dataString) return '-';
    const data = new Date(dataString);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const pegarTotalPorForma = (forma) => {
    const item = totaisForma.find(t => t.forma_pagamento === forma);
    return item ? item.total : 0;
  };

  return (
    <div className="admin-container">
      <HeaderAdmin title="Caixa Diário (Hoje)" />
      
      <div className="admin-body">
        <SidebarAdmin />
        <main className="admin-content">
          
          {/* ====================================
              CARDS DE RESUMO FINANCEIRO DE HOJE
              ==================================== */}
          <div className="caixa-resumo-container mb-20">
            <div className="caixa-cards-row">
              <div className="caixa-card dark-green border-blue">
                <span>TOTAL EM PIX</span>
                <h4>{formatarMoeda(pegarTotalPorForma('PIX'))}</h4>
              </div>
              <div className="caixa-card dark-green border-green">
                <span>TOTAL EM ESPÉCIE</span>
                {/* O backend retorna "DINHEIRO" para espécie */}
                <h4>{formatarMoeda(pegarTotalPorForma('DINHEIRO'))}</h4>
              </div>
              <div className="caixa-card dark-green border-orange">
                <span>TOTAL EM CARTÃO</span>
                {/* O backend retorna "CARTAO" (sem til) */}
                <h4>{formatarMoeda(pegarTotalPorForma('CARTAO'))}</h4>
              </div>
            </div>

            <div className="caixa-total-final mt-20">
              <div className="caixa-card white-card text-center">
                <span>VALOR TOTAL RECEBIDO HOJE</span>
                <h2 className="text-green mt-10">{formatarMoeda(totalGeral)}</h2>
              </div>
            </div>
          </div>

          {/* ====================================
              TABELA DE REGISTROS DE HOJE
              ==================================== */}
          <div className="admin-panel-card mt-20">
            <h3 className="panel-title">Movimentações de Hoje</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Procedimento</th>
                  <th>Forma de Pag.</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Carregando caixa do dia...</td>
                  </tr>
                ) : registros.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Nenhuma movimentação registrada hoje.</td>
                  </tr>
                ) : (
                  registros.map(reg => (
                    <tr key={reg.id}>
                      <td style={{ color: '#888', fontWeight: '500' }}>
                        {formatarHora(reg.criado_em)}
                      </td>
                      <td><strong>{reg.paciente_nome}</strong></td>
                      <td>{reg.procedimento_nome}</td>
                      <td>
                        <span className={`badge-pagamento ${reg.forma_pagamento.toLowerCase()}`}>
                          {reg.forma_pagamento === 'DINHEIRO' ? 'ESPÉCIE' : reg.forma_pagamento}
                        </span>
                      </td>
                      <td style={{ fontWeight: '700', color: '#333' }}>
                        {formatarMoeda(reg.valor)}
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

export default AdminCaixaDiario;