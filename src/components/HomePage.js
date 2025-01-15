import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!localStorage.getItem('isAuthenticated')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <h1>Welcome, {userData.username}! 👋</h1>
        <p>You have successfully logged in with fingerprint authentication.</p>
        <button onClick={handleLogout} className="auth-button">
          Logout
        </button>
      </div>
    </div>
  );
}

export default HomePage; 