import React from 'react';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo text-white">
              <div className="logo-icon bg-white text-black">H</div>
              <span>HERMES</span>
            </div>
            <p className="footer-desc">
              Delivering clarity in a fragmented media landscape.
              See every story from every angle.
            </p>
          </div>

          <div className="footer-column">
            <h4>PLATFORM</h4>
            <div className="footer-links">
              <a href="#">Home</a>
              <a href="#">Explore</a>
              <a href="#">Bias Map</a>
              <a href="#">Methodology</a>
            </div>
          </div>

          <div className="footer-column">
            <h4>COMPANY</h4>
            <div className="footer-links">
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Press</a>
              <a href="#">Contact</a>
            </div>
          </div>

          <div className="footer-column">
            <h4>LEGAL</h4>
            <div className="footer-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookie Policy</a>
              <a href="#">Licenses</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 HERMES PROJECT. ALL RIGHTS RESERVED.</p>
          <p>Independent. Transparent. Unbiased.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
