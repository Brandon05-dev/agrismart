import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './InventoryTable.css';

const InventoryTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/farmer/inventory');
      setProducts(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  const toggleAvailability = async (product) => {
    try {
      const response = await api.put(`/products/${product._id}`, {
        ...product,
        isAvailable: !product.isAvailable
      });
      
      setProducts(products.map(p => 
        p._id === product._id ? response.data.data : p
      ));
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product');
    }
  };

  if (loading) {
    return <div className="loading">Loading inventory...</div>;
  }

  return (
    <div className="inventory-page">
      <div className="container">
        <div className="page-header">
          <h1>My Inventory</h1>
          <Link to="/dashboard/farmer/new-listing" className="btn btn-primary">
            + Add New Product
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {products.length === 0 ? (
          <div className="no-products">
            <p>You haven't listed any products yet.</p>
            <Link to="/dashboard/farmer/new-listing" className="btn btn-primary">
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="inventory-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Market Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td>
                      <div className="product-cell">
                        <strong>{product.name}</strong>
                        {product.description && (
                          <small>{product.description.substring(0, 50)}...</small>
                        )}
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>
                      <strong>${product.unitPrice}</strong>
                      <small>/{product.unit}</small>
                    </td>
                    <td>
                      {product.officialMarketPrice > 0 ? (
                        <div className="market-price-cell">
                          ${product.officialMarketPrice}
                          <span className={`price-diff ${product.unitPrice < product.officialMarketPrice ? 'below' : 'above'}`}>
                            {product.priceTransparencyMetric > 0 ? '+' : ''}
                            {product.priceTransparencyMetric.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td>
                      <span className={product.quantityAvailable > 0 ? '' : 'text-danger'}>
                        {product.quantityAvailable} {product.unit}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`status-toggle ${product.isAvailable ? 'active' : 'inactive'}`}
                        onClick={() => toggleAvailability(product)}
                      >
                        {product.isAvailable ? 'Available' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`/product/${product._id}`} 
                          className="btn-icon"
                          title="View"
                        >
                          👁️
                        </Link>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="btn-icon btn-danger"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="inventory-summary">
          <p>Total Products: <strong>{products.length}</strong></p>
          <p>Active Products: <strong>{products.filter(p => p.isAvailable && p.quantityAvailable > 0).length}</strong></p>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;
