import React from 'react';
import { Link } from 'react-router-dom'; // Assuming navigation will use react-router-dom
import ProfileDropdown from '../ProfileDropdown';

function Header({ token, onLogout, currentUserProfile }) {
  return (
    <header className="header blur-header">
      <div className="logo">✈️ SwiftDelivery</div>
      <nav className="top-nav">
        <ul>
          <li><Link to="/" data-i18n="home">Home</Link></li>
          <li><Link to="/gallery" data-i18n="gallery">Gallery</Link></li>
          <li><Link to="/services" data-i18n="services">Services</Link></li>
          <li><Link to="/track" data-i18n="track">Track</Link></li>
          {!token && (
            <>
              <li><Link to="/login" data-i18n="login">Login</Link></li>
              <li><Link to="/register" data-i18n="register">Register</Link></li>
            </>
          )}
          <li>
            <select id="languageSelect">
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
              <option value="zh">中文</option>
              <option value="ar">العربية</option>
            </select>
          </li>
        </ul>
      </nav>
      <div className="theme-switcher">
        <label htmlFor="themeToggle">🌙</label>
        <input type="checkbox" id="themeToggle" />
      </div>
      {token && currentUserProfile && (
        <ProfileDropdown 
          onLogout={onLogout} 
          user={currentUserProfile}
        />
      )}
      <button id="menuToggle">☰</button>
    </header>
  );
}

export default Header;