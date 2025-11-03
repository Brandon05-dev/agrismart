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
              Bulk Farm Products for Organizations & Institutions
            </p>
            <p className="hero-description">
              Connect directly with farmers for bulk agricultural supplies. Perfect for companies, 
              schools, hospitals, restaurants, and institutions. Fresh products, transparent pricing, 
              and reliable supply chains.
            </p>
            <div className="hero-buttons">
              <Link to="/marketplace" className="btn btn-primary btn-large">
                Browse Products
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
          <h2>Why Choose AgriSmart for Bulk Purchasing?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏢</div>
              <h3>Bulk Supply</h3>
              <p>Farmers post products in bulk quantities perfect for organizations and institutions.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Direct Sourcing</h3>
              <p>Organizations buy directly from farmers, eliminating middlemen and reducing costs.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Price Transparency</h3>
              <p>Compare prices with market rates and see real savings for your institution.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>For Organizations</h3>
              <p>Perfect for schools, hospitals, restaurants, hotels, companies, and institutions.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>Fresh & Quality</h3>
              <p>Access fresh, quality agricultural products straight from verified farmers.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Easy Ordering</h3>
              <p>Browse products, place bulk orders, and manage deliveries all in one platform.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join organizations buying directly from farmers and support local agriculture.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              Register as Buyer
            </Link>
            <Link to="/register" className="btn btn-light btn-large">
              Register as Farmer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
