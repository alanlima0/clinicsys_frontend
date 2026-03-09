import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarAdmin = () => {
  return (
    <aside className="admin-sidebar">
      <nav className="sidebar-nav">
        
        <NavLink 
          to="/admin/dashboard" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          end
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z"/>
          </svg>
          Dashboard
        </NavLink>
        
        <NavLink 
          to="/admin/usuarios" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6m0-5a2 2 0 1 1 0 4 2 2 0 0 1 0-4M.146 8.354a.5.5 0 0 1 .708 0L2.5 10.207l3.146-3.147a.5.5 0 1 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 0-.708z"/>
          </svg>
          Usuários
        </NavLink>
        
        <NavLink 
          to="/admin/procedimentos" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 1a2 2 0 0 1 2 2v2H6V3a2 2 0 0 1 2-2m3 4V3a3 3 0 1 0-6 0v2H1.5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5zM2 6h12v7H2zm4 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5"/>
          </svg>
          Procedimentos
        </NavLink>
        
        <NavLink 
          to="/admin/caixa" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-1.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v1.712c-1.443.098-2.2.846-2.2 1.932 0 .987.625 1.496 1.745 1.76l.473.112v1.25c-.6-.068-.982-.396-1.074-.85zm1.4-3.411c0-.4.32-.7.8-.75v1.46c-.45-.1-.8-.4-.8-.71m1.2 2.45c0 .4.32.7.8.75v-1.45c.45.1.8.4.8.7"/>
          </svg>
          Caixa Diário
        </NavLink>
        
      </nav>
    </aside>
  );
};

export default SidebarAdmin;