import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated, isFarmer } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>🌾 AgriSmart</h1>
          </Link>

          <nav className="nav">
            <Link to="/marketplace" className="nav-link">Marketplace</Link>
            
            {isAuthenticated ? (
              <>
                {isFarmer() ? (
                  <Link to="/dashboard/farmer" className="nav-link">Dashboard</Link>
                ) : (
                  <Link to="/orders" className="nav-link">My Orders</Link>
                )}
                <span className="user-info">
                  {user?.username} ({user?.role})
                </span>
                <button onClick={logout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
