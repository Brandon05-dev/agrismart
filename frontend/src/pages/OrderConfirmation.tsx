import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, MapPin, Calendar, DollarSign, User, Phone, Mail, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { Order, User as UserType } from '../types';
import './OrderConfirmation.css';

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ data: Order }>(`/orders/${orderId}`);
      setOrder(response.data.data);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'Pending': '#ffc107',
      'Confirmed': '#17a2b8',
      'Shipped': '#007bff',
      'Delivered': '#28a745',
      'Cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="order-confirmation-page">
        <div className="container">
          <div className="loading">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-confirmation-page">
        <div className="container">
          <div className="error-state">
            <h2>Order Not Found</h2>
            <p>{error || 'The order you are looking for does not exist.'}</p>
            <Link to="/marketplace" className="btn btn-primary">
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">
            <CheckCircle size={80} color="#28a745" strokeWidth={2} />
          </div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your order. We'll send you a confirmation email shortly.</p>
          <div className="order-number">
            Order #{order._id.slice(-8).toUpperCase()}
          </div>
        </div>

        {/* Order Details */}
        <div className="order-details-layout">
          {/* Left Column */}
          <div className="order-main">
            {/* Status Card */}
            <div className="detail-card">
              <h2>
                <Package size={24} />
                Order Status
              </h2>
              <div className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                {order.status}
              </div>
              <p className="status-description">
                {order.status === 'Pending' && 'Your order is being processed by the farmer.'}
                {order.status === 'Confirmed' && 'Your order has been confirmed and will be shipped soon.'}
                {order.status === 'Shipped' && 'Your order is on its way!'}
                {order.status === 'Delivered' && 'Your order has been delivered. Enjoy!'}
                {order.status === 'Cancelled' && 'This order has been cancelled.'}
              </p>
            </div>

            {/* Order Items */}
            <div className="detail-card">
              <h2>
                <Package size={24} />
                Order Items
              </h2>
              <div className="order-items-list">
                {order.products.map((product, index) => (
                  <div key={index} className="order-item">
                    <div className="item-details">
                      <h3>{product.productName}</h3>
                      <p className="item-quantity">
                        Quantity: {product.quantity} × ${product.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="item-price">
                      ${product.subtotal.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-total">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Tax (8%):</span>
                  <span>${(order.totalAmount * 0.08).toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping:</span>
                  <span className="free">FREE</span>
                </div>
                <div className="total-divider"></div>
                <div className="total-row total-main">
                  <span>Total:</span>
                  <span>${(order.totalAmount * 1.08).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="detail-card">
              <h2>
                <MapPin size={24} />
                Delivery Address
              </h2>
              <div className="address-info">
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="order-sidebar">
            {/* Order Info Card */}
            <div className="detail-card">
              <h2>Order Information</h2>
              
              <div className="info-row">
                <Calendar size={18} />
                <div>
                  <span className="info-label">Order Date</span>
                  <span className="info-value">{formatDate(order.orderDate)}</span>
                </div>
              </div>

              {order.deliveryDate && (
                <div className="info-row">
                  <Calendar size={18} />
                  <div>
                    <span className="info-label">Expected Delivery</span>
                    <span className="info-value">{formatDate(order.deliveryDate)}</span>
                  </div>
                </div>
              )}

              <div className="info-row">
                <DollarSign size={18} />
                <div>
                  <span className="info-label">Payment Method</span>
                  <span className="info-value">Cash on Delivery</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="order-actions">
              <Link to="/marketplace" className="btn btn-primary">
                Continue Shopping
              </Link>
              <Link to="/orders" className="btn btn-secondary">
                View All Orders
              </Link>
            </div>

            {/* Help */}
            <div className="help-card">
              <h3>Need Help?</h3>
              <p>Contact us if you have any questions about your order.</p>
              <div className="contact-info">
                <div className="contact-item">
                  <Mail size={16} />
                  <span>support@agrismart.com</span>
                </div>
                <div className="contact-item">
                  <Phone size={16} />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
