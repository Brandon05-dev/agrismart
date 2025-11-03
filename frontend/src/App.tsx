import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Header from './components/Header';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import FarmerDashboard from './pages/FarmerDashboard';
import NewListingForm from './pages/NewListingForm';
import InventoryTable from './pages/InventoryTable';
import SalesHistory from './pages/SalesHistory';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Header />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              
              {/* Auth Routes - Redirect if already logged in */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />

              {/* Farmer Protected Routes */}
              <Route 
                path="/dashboard/farmer" 
                element={
                  <ProtectedRoute requiredRole="Farmer">
                    <FarmerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/farmer/new-listing" 
                element={
                  <ProtectedRoute requiredRole="Farmer">
                    <NewListingForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/farmer/inventory" 
                element={
                  <ProtectedRoute requiredRole="Farmer">
                    <InventoryTable />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/farmer/sales" 
                element={
                  <ProtectedRoute requiredRole="Farmer">
                    <SalesHistory />
                  </ProtectedRoute>
                } 
              />

              {/* 404 Route */}
              <Route 
                path="*" 
                element={
                  <div className="not-found">
                    <h1>404 - Page Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                  </div>
                } 
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
