import React from 'react';
import { Link } from 'react-router-dom'; // Assuming navigation will use react-router-dom

function SideMenu() {
  return (
    <aside id="sideMenu" className="animated-sidebar">
      <button id="closeMenu">✖</button>
      <ul>
        <li><Link to="/" data-i18n="home">Home</Link></li>
        <li><Link to="/gallery" data-i18n="gallery">Gallery</Link></li>
        <li><Link to="/services" data-i18n="services">Services</Link></li>
        <li><Link to="/track" data-i18n="track">Track</Link></li>
        <li><Link to="/login" data-i18n="login">Login</Link></li>
        <li><Link to="/register" data-i18n="register">Register</Link></li>
        <li>
          <select id="sidebarLanguageSelect">
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
            <option value="zh">中文</option>
            <option value="ar">العربية</option>
          </select>
        </li>
      </ul>
    </aside>
  );
}

export default SideMenu;