import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService'; 
import './AdminDashboard.css';

import HeaderAdmin from '../../components/HeaderAdmin';
import SidebarAdmin from '../../components/SidebarAdmin'; 

const AdminDashboard = () => {
  const [estatisticas, setEstatisticas] = useState({
    atendimentos_hoje: 0,
    caixa_atual: 0, 
    procedimentos: 0     
  });

  const carregarDados = async () => {
    try {
      
      const totalAtendimentos = await adminService.totalAtendimentos();
      const caixaTotal = await adminService.caixaTotal();
      const totalProcedimentos = await adminService.procedimentosTotal();
      
      // Atualiza o estado da tela
      setEstatisticas(prev => ({
        ...prev,
        atendimentos_hoje: totalAtendimentos,
        caixa_atual: caixaTotal || 0,
        procedimentos: totalProcedimentos
      }));

    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="admin-container">
      {/* Barra Superior */}
      <HeaderAdmin />

      <div className="admin-body">
        
        <SidebarAdmin /> 

        {/* Conteúdo Principal */}
        <main className="admin-content">
          <div className="dashboard-cards-grid">
            
            <div className="dash-card border-teal">
              <div className="card-title">Atendimentos Hoje</div>
              <div className="card-value">{estatisticas.atendimentos_hoje}</div>
            </div>

            <div className="dash-card border-dark">
              <div className="card-title">Caixa Atual</div>
              <div className="card-value text-green">
                {formatarMoeda(estatisticas.caixa_atual)}
              </div>
            </div>

            <div className="dash-card border-orange">
              <div className="card-title">Procedimentos</div>
              <div className="card-value">{estatisticas.procedimentos}</div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;