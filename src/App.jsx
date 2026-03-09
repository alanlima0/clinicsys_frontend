// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';


import Privacidade from './pages/auth/Privacidade';

import ProtectedRoute from './components/auth/ProtectedRoute';

import DashboardRecepcao from './pages/recepcao/DashboardRecepcao';
import FilaRecepcao from './pages/recepcao/FilaRecepcao';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminProcedimentos from './pages/admin/AdminProcedimentos';
import AdminCaixaDiario from './pages/admin/AdminCaixaDiario';
import FilaMedico from './pages/medico/FilaMedico';

import PainelTV from './pages/painel/PainelTV'; 
import ProntuarioMedico from './pages/medico/ProntuarioMedico';
import MedicoDashboard from './pages/medico/MedicoDashboard';
import ProntuarioPaciente from './pages/medico/ProntuarioPaciente';

function App() {
  return (
    <Router>
      <Routes>

        {/* =========================================
            ROTAS PÚBLICAS (NÃO PRECISAM DE LOGIN)
        ========================================= */}
        <Route path="/login" element={<Login />} />
        
        {/* ROTA DO PAINEL DA TV */}
        <Route path="/painel" element={<PainelTV />} />

        {/*ROTA PARA O DOCUMENTO DE PRIVACIDADE */}
        <Route path="/privacidade" element={<Privacidade />} />


        {/* =========================================
            ROTAS PROTEGIDAS (PRECISAM DE LOGIN)
        ========================================= */}
        
        {/* Dashboards Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedUserTypes={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute allowedUserTypes={['admin']}>
              <AdminUsuarios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/procedimentos"
          element={
            <ProtectedRoute allowedUserTypes={['admin']}>
              <AdminProcedimentos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/caixa"
          element={
            <ProtectedRoute allowedUserTypes={['admin']}>
              <AdminCaixaDiario />
            </ProtectedRoute>
          }
        />

        {/* Dashboards Médico */}
        <Route
          path="/medico/dashboard"
          element={
            <ProtectedRoute allowedUserTypes={['medico']}>
              <FilaMedico />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medico/pacientes"
          element={
            <ProtectedRoute allowedUserTypes={['medico']}>
              <MedicoDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medico/paciente/:id/historico"
          element={
            <ProtectedRoute allowedUserTypes={['medico']}>
              <ProntuarioPaciente />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/medico/prontuario/:id"
          element={
            <ProtectedRoute allowedUserTypes={['medico']}>
              <ProntuarioMedico />
            </ProtectedRoute>
          }
        />

        {/* Dashboards Recepção */}
        <Route
          path="/recepcionista/dashboard"
          element={
            <ProtectedRoute allowedUserTypes={['recepcao']}>
              <DashboardRecepcao />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recepcionista/fila"
          element={
            <ProtectedRoute allowedUserTypes={['recepcao']}>
              <FilaRecepcao />
            </ProtectedRoute>
          }
        />

        {/* Qualquer outra rota não mapeada joga para o Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}

export default App;