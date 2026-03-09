import React from "react";
import { NavLink } from "react-router-dom"; // 1. Importamos o NavLink
import authService from "../services/authService";
import "./Header.css";

import logoClinicSys from "../assets/logo_clinicsys.png";

const Header = () => {
  const handleLogout = () => {
    authService.logout();
    window.location.href = "/login";
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-area">
          <img src={logoClinicSys} alt="Logo ClinicSys" className="logo-img" />
        </div>

        <nav className="nav-menu">
          {/* 2. Trocamos o <a> por <NavLink> e usamos a propriedade "to" */}
          

          <NavLink
            to="/medico/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Fila de Atendimento
          </NavLink>
          <NavLink
            to="/medico/pacientes"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            end
          >
            Pacientes
          </NavLink>
          
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
