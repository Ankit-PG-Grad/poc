import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
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

  const registerFingerprint = async () => {
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const createCredentialOptions = {
        challenge,
        rp: {
          name: 'PWA Fingerprint Demo',
          id: window.location.hostname,
        },
        user: {
          id: Uint8Array.from(formData.username, c => c.charCodeAt(0)),
          name: formData.email,
          displayName: formData.username,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
      };

      const credential = await navigator.credentials.create({
        publicKey: createCredentialOptions,
      });

      if (credential) {
        // In a real app, you would send the credential to your server
        localStorage.setItem('user', JSON.stringify({
          username: formData.username,
          email: formData.email,
          credentialId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId)))
        }));
        setMessage('Registration successful!');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      setError('Error registering fingerprint: ' + err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    await registerFingerprint();
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Sign Up</h2>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter username"
            />
          </div>
          
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
            Sign Up with Fingerprint
          </button>
        </form>
        
        <p className="auth-link">
          Already have an account? <span onClick={() => navigate('/login')}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default SignupPage; 