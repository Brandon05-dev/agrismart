import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Apple, Wheat, Milk, Bird, Sprout, Truck, DollarSign, CheckCircle, TrendingUp } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import api from '../utils/api';
import './Home.css';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async (): Promise<void> => {
    try {
      const response = await api.get<{ data: Product[] }>('/products', {
        params: {
          sortBy: 'createdAt',
          order: 'desc',
          limit: 12
        }
      });
      setFeaturedProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Vegetables', icon: Leaf, color: '#4caf50' },
    { name: 'Fruits', icon: Apple, color: '#ff9800' },
    { name: 'Grains', icon: Wheat, color: '#795548' },
    { name: 'Dairy', icon: Milk, color: '#2196f3' },
    { name: 'Poultry', icon: Bird, color: '#f44336' },
    { name: 'Other', icon: Sprout, color: '#9c27b0' }
  ];

  return (
    <div className="home">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Bulk Farm Products for Your Organization</h1>
              <p>Direct from farmers • Bulk quantities • Best prices</p>
              <Link to="/marketplace" className="btn btn-hero">
                Shop Now
              </Link>
            </div>
            <div className="hero-image">
              <div className="hero-badge">
                <Wheat size={64} color="#4a7c59" strokeWidth={2} />
                <div>
                  <div className="badge-title">Fresh & Direct</div>
                  <div className="badge-subtitle">From Local Farmers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.name}
                  to={`/marketplace?category=${category.name}`}
                  className="category-card"
                  style={{ borderTopColor: category.color }}
                >
                  <div className="category-icon" style={{ backgroundColor: `${category.color}20` }}>
                    <Icon size={48} color={category.color} strokeWidth={2} />
                  </div>
                  <h3>{category.name}</h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/marketplace" className="see-all-link">
              See All <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : featuredProducts.length === 0 ? (
            <div className="no-products">
              <p>No products available at the moment.</p>
              <Link to="/register" className="btn btn-primary">
                Become a Farmer & List Products
              </Link>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="benefits-section">
        <div className="container">
          <h2 className="section-title">Why Choose AgriSmart?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <Truck size={48} color="#4a7c59" strokeWidth={2} />
              </div>
              <h3>Bulk Orders</h3>
              <p>Large quantities for organizations, schools, and institutions</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <DollarSign size={48} color="#4a7c59" strokeWidth={2} />
              </div>
              <h3>Best Prices</h3>
              <p>Direct from farmers - no middlemen markup</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <CheckCircle size={48} color="#4a7c59" strokeWidth={2} />
              </div>
              <h3>Quality Assured</h3>
              <p>Fresh products from verified farmers</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <TrendingUp size={48} color="#4a7c59" strokeWidth={2} />
              </div>
              <h3>Transparent Pricing</h3>
              <p>Compare with market rates and see real savings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Ordering?</h2>
            <p>Join hundreds of organizations buying directly from farmers</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-cta-primary">
                Register Now
              </Link>
              <Link to="/marketplace" className="btn btn-cta-secondary">
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
