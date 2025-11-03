import React from 'react';
import { Link } from 'react-router-dom';
import { Product, User } from '../types';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
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
              {quantityAvailable} {unit} available
            </span>
          ) : (
            <span className="out-of-stock">Out of stock</span>
          )}
        </div>

        <Link to={`/product/${_id}`} className="btn btn-view">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
