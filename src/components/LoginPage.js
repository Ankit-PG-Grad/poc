import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (window.PublicKeyCredential) {
      setSupported(true);
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => {
          if (!available) {
            setError('Fingerprint authentication is not available on this device');
          }
        })
        .catch((err) => {
          setError('Error checking authenticator availability: ' + err);
        });
    } else {
      setError('WebAuthn is not supported in this browser');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const verifyFingerprint = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || userData.email !== formData.email) {
        setError('User not found or incorrect email');
        return;
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const getCredentialOptions = {
        challenge,
        timeout: 60000,
        userVerification: 'required',
      };

      const assertion = await navigator.credentials.get({
        publicKey: getCredentialOptions,
      });

      if (assertion) {
        setMessage('Login successful!');
        localStorage.setItem('isAuthenticated', 'true');
        setTimeout(() => navigate('/home'), 1500);
      }
    } catch (err) {
      setError('Error verifying fingerprint: ' + err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    await verifyFingerprint();
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={!supported || error}
          >
            Login with Fingerprint
          </button>
        </form>
        
        <p className="auth-link">
          Don't have an account? <span onClick={() => navigate('/signup')}>Sign Up</span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage; 