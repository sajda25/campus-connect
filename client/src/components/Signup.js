import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';

function Signup() {
  const [formData, setFormData] = useState({
    studentId: '',
    email: '',
    name: '',
    hostel: '',
    room: '',
    password: '',
    contactInfo: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/signup', formData);
      setMessage('🎉 Welcome to Campus Connect! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.message || 'Signup failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-particles"></div>
      <div className="signup-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      
      <div className="signup-container">
        <div className="signup-header">
          <div className="signup-logo">
            <div className="logo-circle">
              <span className="logo-text">CC</span>
            </div>
            <div className="logo-pulse"></div>
          </div>
          <h1 className="signup-title">
            Join Campus Connect
            <span className="title-gradient">✨</span>
          </h1>
          <p className="signup-subtitle">
            Create your account and start trading in your campus community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-row">
            <div className={`form-group ${focusedField === 'studentId' ? 'focused' : ''}`}>
              <label htmlFor="studentId" className="form-label">
                🎓 Student ID
              </label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                onFocus={() => handleFocus('studentId')}
                onBlur={handleBlur}
                className="form-input"
                placeholder="e.g., 22BCS14422"
                required
              />
              <div className="input-highlight"></div>
            </div>

            <div className={`form-group ${focusedField === 'email' ? 'focused' : ''}`}>
              <label htmlFor="email" className="form-label">
                📧 Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
                className="form-input"
                placeholder="your.email@cuchd.in"
                required
              />
              <div className="input-highlight"></div>
            </div>
          </div>

          <div className={`form-group ${focusedField === 'name' ? 'focused' : ''}`}>
            <label htmlFor="name" className="form-label">
              👤 Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => handleFocus('name')}
              onBlur={handleBlur}
              className="form-input"
              placeholder="Enter your full name"
              required
            />
            <div className="input-highlight"></div>
          </div>

          <div className="form-row">
            <div className={`form-group ${focusedField === 'hostel' ? 'focused' : ''}`}>
              <label htmlFor="hostel" className="form-label">
                🏠 Hostel
              </label>
              <input
                type="text"
                id="hostel"
                name="hostel"
                value={formData.hostel}
                onChange={handleChange}
                onFocus={() => handleFocus('hostel')}
                onBlur={handleBlur}
                className="form-input"
                placeholder="e.g., LC, UC, etc."
                required
              />
              <div className="input-highlight"></div>
            </div>

            <div className={`form-group ${focusedField === 'room' ? 'focused' : ''}`}>
              <label htmlFor="room" className="form-label">
                🚪 Room Number
              </label>
              <input
                type="text"
                id="room"
                name="room"
                value={formData.room}
                onChange={handleChange}
                onFocus={() => handleFocus('room')}
                onBlur={handleBlur}
                className="form-input"
                placeholder="e.g., 216"
                required
              />
              <div className="input-highlight"></div>
            </div>
          </div>

          <div className="form-row">
            <div className={`form-group ${focusedField === 'password' ? 'focused' : ''}`}>
              <label htmlFor="password" className="form-label">
                🔒 Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => handleFocus('password')}
                onBlur={handleBlur}
                className="form-input"
                placeholder="Create a strong password"
                required
              />
              <div className="input-highlight"></div>
            </div>

            <div className={`form-group ${focusedField === 'contactInfo' ? 'focused' : ''}`}>
              <label htmlFor="contactInfo" className="form-label">
                📱 Contact Number
              </label>
              <input
                type="text"
                id="contactInfo"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
                onFocus={() => handleFocus('contactInfo')}
                onBlur={handleBlur}
                className="form-input"
                placeholder="Your phone number"
                required
              />
              <div className="input-highlight"></div>
            </div>
          </div>

          <button type="submit" className="signup-submit" disabled={isLoading}>
            <div className="button-content">
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Creating your account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="button-icon">🚀</span>
                </>
              )}
            </div>
            <div className="button-glow"></div>
          </button>

          {message && (
            <div className={`signup-message ${message.includes('🎉') ? 'success' : 'error'}`}>
              <div className="message-content">
                {message}
              </div>
            </div>
          )}
        </form>

        <div className="signup-footer">
          <div className="divider">
            <span>Already have an account?</span>
          </div>
          <Link to="/login" className="login-link">
            <span>Sign In</span>
            <span className="link-arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup; 