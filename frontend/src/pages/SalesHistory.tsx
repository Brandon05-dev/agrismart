import React, { useState, useEffect } from 'react';
import { Order, SalesStatistics, User } from '../types';
import api from '../utils/api';
import './SalesHistory.css';

const SalesHistory: React.FC = () => {
  const [sales, setSales] = useState<Order[]>([]);
  const [statistics, setStatistics] = useState<SalesStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchSalesHistory();
  }, []);

  const fetchSalesHistory = async (): Promise<void> => {
    try {
      const response = await api.get<{ data: Order[]; statistics: SalesStatistics }>('/farmer/sales');
      setSales(response.data.data);
      setStatistics(response.data.statistics);
      setError('');
    } catch (err) {
      console.error('Error fetching sales history:', err);
      setError('Failed to load sales history');
    } finally {
      setLoading(false);
    }
  };

  const getBuyerInfo = (order: Order): string => {
    if (typeof order.buyerId === 'string') {
      return 'Unknown';
    }
    return (order.buyerId as User).username || 'Unknown';
  };

  const getBuyerEmail = (order: Order): string | undefined => {
    if (typeof order.buyerId === 'string') {
      return undefined;
    }
    return (order.buyerId as User).email;
  };

  if (loading) {
    return <div className="loading">Loading sales history...</div>;
  }

  return (
    <div className="sales-history-page">
      <div className="container">
        <h1>Sales History</h1>

        {statistics && (
          <div className="sales-stats">
            <div className="stat-box">
              <h3>${statistics.totalSales.toFixed(2)}</h3>
              <p>Total Sales</p>
            </div>
            <div className="stat-box">
              <h3>{statistics.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
            <div className="stat-box">
              <h3>${(statistics.totalSales / statistics.totalOrders || 0).toFixed(2)}</h3>
              <p>Average Order Value</p>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {sales.length === 0 ? (
          <div className="no-sales">
            <p>You haven't received any orders yet.</p>
          </div>
        ) : (
          <div className="sales-list">
            {sales.map(order => (
              <div key={order._id} className="sale-card">
                <div className="sale-header">
                  <div>
                    <strong>Order #{order._id.slice(-8)}</strong>
                    <p className="sale-date">
                      {new Date(order.orderDate).toLocaleString()}
                    </p>
                  </div>
                  <div className="sale-status-amount">
                    <span className={`status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                    <strong className="sale-amount">${order.farmerTotal.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="sale-buyer">
                  <strong>Buyer:</strong> {getBuyerInfo(order)}
                  {getBuyerEmail(order) && (
                    <span> ({getBuyerEmail(order)})</span>
                  )}
                </div>

                <div className="sale-products">
                  <strong>Products:</strong>
                  <ul>
                    {order.products.map((item, idx) => (
                      <li key={idx}>
                        {item.productName} - {item.quantity} units × ${item.unitPrice} = ${item.subtotal.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>

                {order.shippingAddress && (
                  <div className="sale-address">
                    <strong>Shipping Address:</strong>
                    <p>
                      {order.shippingAddress.street}, {order.shippingAddress.city}, 
                      {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;
