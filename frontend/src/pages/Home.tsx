import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>🌾 Welcome to AgriSmart</h1>
            <p className="hero-subtitle">
              Connecting Farmers Directly with Buyers
            </p>
            <p className="hero-description">
              Eliminate middlemen, ensure fair prices, and support local agriculture. 
              Our marketplace promotes transparency and empowers farmers to earn what they deserve.
            </p>
            <div className="hero-buttons">
              <Link to="/marketplace" className="btn btn-primary btn-large">
                Browse Marketplace
              </Link>
              <Link to="/register" className="btn btn-secondary btn-large">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose AgriSmart?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Fair Pricing</h3>
              <p>Transparent pricing that ensures farmers get paid fairly while buyers save money.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Direct Connection</h3>
              <p>Buy directly from farmers, eliminating middlemen and supporting local agriculture.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Price Transparency</h3>
              <p>Compare farmer prices with market rates to see real savings and fair pricing.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>Fresh Products</h3>
              <p>Access to fresh, quality products straight from the source to your table.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>SDG Aligned</h3>
              <p>Contributing to SDG 2 (Zero Hunger) and SDG 8 (Decent Work) goals.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Easy to Use</h3>
              <p>Simple, intuitive platform for both farmers to list and buyers to purchase.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of farmers and buyers making agriculture better for everyone.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              Register as Farmer
            </Link>
            <Link to="/register" className="btn btn-light btn-large">
              Register as Buyer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
