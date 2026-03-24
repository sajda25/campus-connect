import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      alert('Thank you for subscribing! 🎉');
      setEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-wave"></div>
      
      <div className="footer-content">
        <div className="footer-main">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              Campus Connect
            </div>
            <p className="footer-description">
              Revolutionizing campus commerce with a modern, secure, and user-friendly marketplace. 
              Connect, trade, and thrive in your college community like never before.
            </p>

            <div className="social-links">
              <a href="#" className="social-link" title="Facebook">📘</a>
              <a href="#" className="social-link" title="Twitter">🐦</a>
              <a href="#" className="social-link" title="Instagram">📷</a>
              <a href="https://www.linkedin.com/in/sajda-sabnam-486614265/" className="social-link" title="LinkedIn" target="_blank" rel="noopener noreferrer">💼</a>
              <a href="#" className="social-link" title="GitHub">💻</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3>🚀 Quick Links</h3>
            <ul className="footer-links">
              <li><a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a></li>
              <li><a href="/products" onClick={(e) => { e.preventDefault(); navigate('/products'); }}>Browse Products</a></li>
              <li><a href="/add-product" onClick={(e) => { e.preventDefault(); navigate('/add-product'); }}>Sell Items</a></li>
              <li><a href="/profile" onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>My Profile</a></li>
              <li><a href="/chat" onClick={(e) => { e.preventDefault(); navigate('/chat'); }}>Messages</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h3>🏷️ Categories</h3>
            <ul className="footer-links">
              <li><a href="#electronics">📱 Electronics</a></li>
              <li><a href="#books">📚 Books & Study</a></li>
              <li><a href="#clothing">👕 Clothing</a></li>
              <li><a href="#furniture">🪑 Furniture</a></li>
              <li><a href="#sports">⚽ Sports & Fitness</a></li>
              <li><a href="#other">📦 Other Items</a></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="footer-section">
            <h3>💬 Contact & Support</h3>
            
            <div className="contact-item">
              <div className="contact-icon">📧</div>
              <div className="contact-info">
                <h4>Email Support</h4>
                <p>support@campusconnect.edu</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div className="contact-info">
                <h4>Phone Support</h4>
                <p>+1 (555) 123-CAMP</p>
              </div>
            </div>

            <ul className="footer-links" style={{ marginTop: '1rem' }}>
              <li><a href="#privacy">🔒 Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="newsletter">
          <h3>🎯 Stay Updated!</h3>
          <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '1rem' }}>
            Get the latest deals, new arrivals, and campus marketplace tips delivered to your inbox!
          </p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              className="newsletter-input"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="newsletter-btn">
              Subscribe 🚀
            </button>
          </form>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p className="copyright">
              © {currentYear} Campus Connect. Made with ❤️ for college communities worldwide.
            </p>
            <div className="footer-badges">
              <span className="badge">🔒 Secure</span>
              <span className="badge">⚡ Fast</span>
              <span className="badge">🌟 Trusted</span>
              <span className="badge">📱 Mobile Ready</span>
            </div>
          </div>
          
          <div className="footer-bottom-right">
            <button className="back-to-top" onClick={scrollToTop} title="Back to Top">
              ⬆️
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;