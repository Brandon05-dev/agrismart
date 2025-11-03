import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductFormData } from '../types';
import api from '../utils/api';
import './NewListingForm.css';

const NewListingForm: React.FC = () => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: 'Vegetables',
    unitPrice: '',
    unit: 'kg',
    quantityAvailable: '',
    imageUrl: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Poultry', 'Other'];
  const units = ['kg', 'lb', 'dozen', 'liter', 'piece'];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/products', formData);
      navigate('/dashboard/farmer/inventory');
    } catch (err: any) {
      console.error('Error creating product:', err);
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-listing-page">
      <div className="container">
        <div className="form-container">
          <h1>List New Bulk Product</h1>
          <p>List your agricultural products in bulk quantities for organizations and institutions</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="listing-form">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Fresh Tomatoes (Bulk Supply)"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your product quality, certifications, and bulk supply details..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Unit *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price per Unit * ($)</label>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Bulk Quantity Available *</label>
                <input
                  type="number"
                  name="quantityAvailable"
                  value={formData.quantityAvailable}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="Minimum bulk quantity"
                />
                <small>Enter the bulk quantity available for institutional buyers</small>
              </div>
            </div>

            <div className="form-group">
              <label>Image URL (Optional)</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard/farmer/inventory')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewListingForm;
