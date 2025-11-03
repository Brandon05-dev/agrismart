import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Product, User } from '../types';
import './Cart.css';

const Cart: React.FC = () => {
  const { cart, loading, updateCartItem, removeFromCart, clearCart, cartExpired, clearCartExpiredFlag } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState<string | null>(null);
  const [showExpirationNotice, setShowExpirationNotice] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Show expiration notice when cart expires
  useEffect(() => {
    if (cartExpired) {
      setShowExpirationNotice(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowExpirationNotice(false);
        clearCartExpiredFlag();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [cartExpired, clearCartExpiredFlag]);

  const handleQuantityChange = async (productId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    try {
      setUpdating(productId);
      await updateCartItem(productId, newQuantity);
    } catch (error: any) {
      alert(error.message || 'Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      try {
        setUpdating(productId);
        await removeFromCart(productId);
      } catch (error: any) {
        alert(error.message || 'Failed to remove item');
      } finally {
        setUpdating(null);
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        await clearCart();
      } catch (error: any) {
        alert(error.message || 'Failed to clear cart');
      }
    }
  };

  const handleCheckout = () => {
    if (!user) {
      alert('Please login to proceed with checkout');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'Buyer') {
      alert('Only buyers can place orders');
      return;
    }
    
    // Navigate to checkout page
    navigate('/checkout');
  };

  const getProductId = (productId: string | Product): string => {
    return typeof productId === 'string' ? productId : productId._id;
  };

  const getFarmerName = (farmerId?: User | string): string => {
    if (!farmerId) return 'Unknown Farmer';
    if (typeof farmerId === 'string') return 'Unknown Farmer';
    return (farmerId as User).farmName || (farmerId as User).username;
  };

  if (loading && !cart) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="loading">Loading your cart...</div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <ShoppingCart size={80} color="#ccc" strokeWidth={1.5} />
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <Link to="/marketplace" className="btn btn-primary">
              <ShoppingBag size={20} />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        {showExpirationNotice && (
          <div className="expiration-notice">
            <div className="expiration-notice-content">
              <span className="expiration-icon">⏰</span>
              <div className="expiration-text">
                <strong>Your cart has expired</strong>
                <p>Guest carts expire after 24 hours of inactivity. Please add items again or login to save your cart permanently.</p>
              </div>
              <button 
                className="close-notice" 
                onClick={() => {
                  setShowExpirationNotice(false);
                  clearCartExpiredFlag();
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="cart-header">
          <Link to="/marketplace" className="back-link">
            <ArrowLeft size={20} />
            Continue Shopping
          </Link>
          <h1>
            <ShoppingCart size={32} />
            Shopping Cart
          </h1>
          <button onClick={handleClearCart} className="btn-clear-cart">
            Clear Cart
          </button>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            <div className="cart-items-header">
              <h2>Cart Items ({cart.totalItems})</h2>
            </div>

            {cart.items.map((item) => (
              <div key={item._id || getProductId(item.productId)} className="cart-item">
                <div className="item-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="no-image">📦</div>
                  )}
                </div>

                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-farmer">
                    🌾 {getFarmerName(item.farmerId)}
                  </p>
                  <p className="item-price">
                    ${item.unitPrice.toFixed(2)} per {item.unit}
                  </p>
                </div>

                <div className="item-quantity">
                  <label>Quantity:</label>
                  <div className="quantity-controls">
                    <button
                      onClick={() => handleQuantityChange(getProductId(item.productId), item.quantity, -1)}
                      disabled={updating === getProductId(item.productId) || item.quantity <= 1}
                      className="btn-quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="quantity-value">
                      {item.quantity} {item.unit}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(getProductId(item.productId), item.quantity, 1)}
                      disabled={updating === getProductId(item.productId)}
                      className="btn-quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="item-subtotal">
                  <label>Subtotal:</label>
                  <p className="subtotal-amount">${item.subtotal.toFixed(2)}</p>
                </div>

                <button
                  onClick={() => handleRemoveItem(getProductId(item.productId))}
                  disabled={updating === getProductId(item.productId)}
                  className="btn-remove"
                  title="Remove item"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Items:</span>
              <span>{cart.totalItems}</span>
            </div>

            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${cart.totalAmount.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping:</span>
              <span className="text-muted">Calculated at checkout</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row summary-total">
              <span>Total:</span>
              <span>${cart.totalAmount.toFixed(2)}</span>
            </div>

            <button onClick={handleCheckout} className="btn btn-checkout">
              Proceed to Checkout
            </button>

            <div className="cart-info">
              <p>✓ Secure checkout</p>
              <p>✓ Direct from farmers</p>
              <p>✓ Fresh products guaranteed</p>
            </div>

            {!user && (
              <div className="guest-notice">
                <p>
                  💡 <Link to="/login">Login</Link> or <Link to="/register">Register</Link> to save your cart permanently
                </p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  ⏰ Guest carts expire after 24 hours
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
