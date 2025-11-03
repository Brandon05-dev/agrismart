import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product, User } from '../types';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState<number>(1);
  const [adding, setAdding] = useState<boolean>(false);
  const {
    _id,
    name,
    description,
    category,
    unitPrice,
    unit,
    officialMarketPrice,
    priceTransparencyMetric,
    quantityAvailable,
    imageUrl,
    farmerId
  } = product;

  // Calculate savings
  const savings = officialMarketPrice > 0 ? (officialMarketPrice - unitPrice).toFixed(2) : 0;
  const isBelowMarket = unitPrice < officialMarketPrice;

  // Type guard to check if farmerId is a User object
  const getFarmerName = (): string => {
    if (typeof farmerId === 'string') {
      return 'Unknown Farmer';
    }
    return (farmerId as User).farmName || (farmerId as User).username;
  };

  const handleAddToCart = async () => {
    if (quantity < 1) {
      alert('Please select a valid quantity');
      return;
    }

    if (quantity > quantityAvailable) {
      alert(`Only ${quantityAvailable} ${unit} available`);
      return;
    }

    try {
      setAdding(true);
      await addToCart(_id, quantity);
      alert(`Added ${quantity} ${unit} of ${name} to cart!`);
      setQuantity(1); // Reset quantity
    } catch (error: any) {
      alert(error.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < quantityAvailable) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">
        {imageUrl ? (
          <img src={imageUrl} alt={name} />
        ) : (
          <div className="no-image">📦 {name}</div>
        )}
        {isBelowMarket && (
          <span className="savings-badge">Save ${savings}</span>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <p className="product-category">{category}</p>
        
        {description && (
          <p className="product-description">{description}</p>
        )}

        <div className="product-farmer">
          <span>🌾 {getFarmerName()}</span>
        </div>

        <div className="product-pricing">
          <div className="price-main">
            <span className="price">${unitPrice}</span>
            <span className="unit">per {unit}</span>
          </div>

          {officialMarketPrice > 0 && (
            <div className="price-comparison">
              <div className="market-price">
                Market: ${officialMarketPrice}
              </div>
              <div className={`price-metric ${isBelowMarket ? 'positive' : 'negative'}`}>
                {isBelowMarket ? '✓' : '⚠'} 
                {priceTransparencyMetric > 0 ? '+' : ''}
                {priceTransparencyMetric.toFixed(1)}% vs market
              </div>
            </div>
          )}
        </div>

        <div className="product-stock">
          {quantityAvailable > 0 ? (
            <span className="in-stock">
              ✓ {quantityAvailable} {unit} available in bulk
            </span>
          ) : (
            <span className="out-of-stock">Out of stock</span>
          )}
        </div>

        {quantityAvailable > 0 && (
          <div className="product-cart-controls">
            <div className="quantity-selector">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="qty-btn"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  if (val >= 1 && val <= quantityAvailable) {
                    setQuantity(val);
                  }
                }}
                min="1"
                max={quantityAvailable}
                className="qty-input"
              />
              <button
                onClick={incrementQuantity}
                disabled={quantity >= quantityAvailable}
                className="qty-btn"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="btn btn-add-to-cart"
            >
              <ShoppingCart size={18} />
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        )}

        <Link to={`/product/${_id}`} className="btn btn-view">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
