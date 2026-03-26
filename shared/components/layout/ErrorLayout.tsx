import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/ErrorPages.css';

interface ErrorProps {
  code: string;
  title: string;
  message: string;
  icon: string;
}

const ErrorLayout: React.FC<ErrorProps> = ({ code, title, message, icon }) => {
  const navigate = useNavigate();

  return (
    <div className="error-container">
      <div className="error-card">
        <h1 className="error-code">{code}</h1>

        <span className="material-symbols-outlined error-icon">
          {icon}
        </span>

        <h2 className="error-title">{title}</h2>
        <p className="error-message">{message}</p>

        <button className="action-btn" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined">home</span>
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default ErrorLayout;