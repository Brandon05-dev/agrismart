import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import api from '../utils/api';
import './Marketplace.css';

const Marketplace: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Poultry', 'Other'];

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sortBy]);

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const params: any = {
        sortBy,
        order: 'desc'
      };

      if (category && category !== 'All') {
        params.category = category;
      }

      if (search) {
        params.search = search;
      }

      const response = await api.get<{ data: Product[] }>('/products', { params });
      setProducts(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="marketplace">
      <div className="container">
        <div className="marketplace-header">
          <h1>Marketplace</h1>
          <p>Discover fresh products directly from farmers</p>
        </div>

        <div className="filters">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={category} 
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat === 'All' ? '' : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="createdAt">Newest</option>
              <option value="unitPrice">Price: Low to High</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <p>No products found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
