import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, CreditCard, User, Phone, Mail } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Checkout.css';

interface ShippingFormData {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  deliveryNotes?: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<ShippingFormData>({
    fullName: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    deliveryNotes: ''
  });
  const [errors, setErrors] = useState<Partial<ShippingFormData>>({});

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      alert('Please login to proceed with checkout');
      navigate('/login');
      return;
    }

    // Redirect if cart is empty
    if (!cart || cart.items.length === 0) {
      alert('Your cart is empty');
      navigate('/cart');
      return;
    }
  }, [user, cart, navigate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name as keyof ShippingFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingFormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!cart || cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        items: cart.items.map(item => ({
          productId: typeof item.productId === 'string' ? item.productId : item.productId._id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal
        })),
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        contactInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone
        },
        deliveryNotes: formData.deliveryNotes,
        totalAmount: cart.totalAmount
      };

      const response = await api.post('/orders/checkout', orderData);

      if (response.data.success) {
        // Clear cart after successful order
        await clearCart();
        // Navigate to order confirmation
        navigate(`/order-confirmation/${response.data.data._id}`);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return null;
  }

  const shippingCost: number = 0; // Free shipping for now
  const tax: number = cart.totalAmount * 0.08; // 8% tax
  const total: number = cart.totalAmount + shippingCost + tax;

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>
            <ShoppingBag size={32} />
            Checkout
          </h1>
          <p>Complete your order and get fresh products delivered</p>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-layout">
            {/* Left Column - Forms */}
            <div className="checkout-forms">
              {/* Contact Information */}
              <div className="form-section">
                <h2>
                  <User size={24} />
                  Contact Information
                </h2>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={errors.fullName ? 'error' : ''}
                      placeholder="John Doe"
                    />
                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      <Mail size={16} />
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'error' : ''}
                      placeholder="john@example.com"
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      <Phone size={16} />
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? 'error' : ''}
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="form-section">
                <h2>
                  <MapPin size={24} />
                  Shipping Address
                </h2>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="street">Street Address *</label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className={errors.street ? 'error' : ''}
                      placeholder="123 Main Street, Apt 4B"
                    />
                    {errors.street && <span className="error-message">{errors.street}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={errors.city ? 'error' : ''}
                      placeholder="New York"
                    />
                    {errors.city && <span className="error-message">{errors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={errors.state ? 'error' : ''}
                      placeholder="NY"
                    />
                    {errors.state && <span className="error-message">{errors.state}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="zipCode">ZIP Code *</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={errors.zipCode ? 'error' : ''}
                      placeholder="10001"
                    />
                    {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">Country *</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={errors.country ? 'error' : ''}
                      placeholder="USA"
                    />
                    {errors.country && <span className="error-message">{errors.country}</span>}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="deliveryNotes">Delivery Notes (Optional)</label>
                    <textarea
                      id="deliveryNotes"
                      name="deliveryNotes"
                      value={formData.deliveryNotes}
                      onChange={handleInputChange}
                      placeholder="Any special delivery instructions..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Placeholder */}
              <div className="form-section">
                <h2>
                  <CreditCard size={24} />
                  Payment Method
                </h2>
                <div className="payment-placeholder">
                  <p>💳 Payment will be collected on delivery (Cash on Delivery)</p>
                  <p className="payment-note">Secure payment integration coming soon!</p>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="checkout-sidebar">
              <div className="order-summary">
                <h2>Order Summary</h2>

                <div className="summary-items">
                  {cart.items.map((item, index) => (
                    <div key={item._id || index} className="summary-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">
                          {item.quantity} {item.unit} × ${item.unitPrice.toFixed(2)}
                        </span>
                      </div>
                      <span className="item-total">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="summary-divider"></div>

                <div className="summary-calculations">
                  <div className="calc-row">
                    <span>Subtotal:</span>
                    <span>${cart.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="calc-row">
                    <span>Shipping:</span>
                    <span className="free">{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="calc-row">
                    <span>Tax (8%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-total">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-place-order"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>

                <div className="order-info">
                  <p>✓ Secure checkout</p>
                  <p>✓ Direct from farmers</p>
                  <p>✓ Fresh products guaranteed</p>
                  <p>✓ Free shipping on all orders</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
