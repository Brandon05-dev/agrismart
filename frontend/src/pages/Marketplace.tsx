import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import TenderCard from '../components/TenderCard';
import { Tender } from '../types';
import api from '../utils/api';
import './Marketplace.css';

const Marketplace: React.FC = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');

  const statusOptions = ['All', 'Open', 'Closed', 'Awarded'];

  useEffect(() => {
    fetchTenders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sortBy]);

  const fetchTenders = async (): Promise<void> => {
    try {
      setLoading(true);
      const params: any = {
        sortBy,
        order: 'desc'
      };

      if (statusFilter && statusFilter !== 'All') {
        params.status = statusFilter;
      }

      if (search) {
        params.search = search;
      }

      const response = await api.get<{ data: Tender[] }>('/tenders', { params });
      setTenders(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching tenders:', err);
      setError('Failed to load tenders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    fetchTenders();
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
              placeholder="Search tenders..."
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map((status: string) => (
                <option key={status} value={status === 'All' ? '' : status}>
                  {status}
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
              <option value="closingDate">Closing Soon</option>
              <option value="budgetRange.max">Budget: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading tenders...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : tenders.length === 0 ? (
          <div className="no-products">
            <p>No tenders found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="products-grid">
            {tenders.map((tender: Tender) => (
              <TenderCard key={tender._id} tender={tender} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
