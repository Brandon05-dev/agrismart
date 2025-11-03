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
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');

  const categoryOptions = ['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Poultry', 'Other'];

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, sortBy]);

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const params: any = {
        sortBy,
        order: 'desc'
      };

      if (categoryFilter && categoryFilter !== 'All') {
        params.category = categoryFilter;
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
          <h1>Bulk Farm Products Marketplace</h1>
          <p>Discover bulk agricultural products directly from farmers - perfect for organizations, institutions, and businesses</p>
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
              value={categoryFilter} 
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              {categoryOptions.map((category: string) => (
                <option key={category} value={category === 'All' ? '' : category}>
                  {category}
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
              <option value="-unitPrice">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
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
            {products.map((product: Product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
