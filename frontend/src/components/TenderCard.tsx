import React from 'react';
import { Link } from 'react-router-dom';
import { Tender, User } from '../types';
import './TenderCard.css';

interface TenderCardProps {
  tender: Tender;
}

const TenderCard: React.FC<TenderCardProps> = ({ tender }) => {
  const {
    _id,
    title,
    description,
    buyerId,
    requirements,
    deliveryLocation,
    deliverySchedule,
    budgetRange,
    closingDate,
    status,
    createdAt
  } = tender;

  const getBuyerName = (): string => {
    if (typeof buyerId === 'string') {
      return 'Unknown Organization';
    }
    return (buyerId as User).organizationName || (buyerId as User).username;
  };

  const getOrganizationType = (): string | undefined => {
    if (typeof buyerId === 'string') {
      return undefined;
    }
    return (buyerId as User).organizationType;
  };

  const isClosingSoon = (): boolean => {
    const daysUntilClosing = Math.ceil(
      (new Date(closingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilClosing <= 3 && daysUntilClosing > 0;
  };

  const daysRemaining = (): number => {
    return Math.max(
      0,
      Math.ceil((new Date(closingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    );
  };

  return (
    <div className={`tender-card ${status.toLowerCase()}`}>
      <div className="tender-header">
        <div className="tender-status-badge">
          <span className={`status ${status.toLowerCase()}`}>{status}</span>
          {isClosingSoon() && status === 'Open' && (
            <span className="closing-soon">⚠️ Closing Soon</span>
          )}
        </div>
        <div className="tender-organization">
          <strong>{getBuyerName()}</strong>
          {getOrganizationType() && (
            <span className="org-type"> • {getOrganizationType()}</span>
          )}
        </div>
      </div>

      <div className="tender-info">
        <h3 className="tender-title">{title}</h3>
        <p className="tender-description">{description}</p>

        <div className="tender-requirements">
          <strong>Requirements:</strong>
          <ul>
            {requirements.slice(0, 3).map((req, idx) => (
              <li key={idx}>
                {req.productName} - {req.quantity} {req.unit}
              </li>
            ))}
            {requirements.length > 3 && (
              <li className="more-items">+{requirements.length - 3} more items</li>
            )}
          </ul>
        </div>

        <div className="tender-details">
          <div className="detail-item">
            <span className="label">📍 Delivery:</span>
            <span className="value">{deliveryLocation}</span>
          </div>
          <div className="detail-item">
            <span className="label">📅 Schedule:</span>
            <span className="value">
              {new Date(deliverySchedule.startDate).toLocaleDateString()} - 
              {new Date(deliverySchedule.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">💰 Budget Range:</span>
            <span className="value">
              ${budgetRange.min.toLocaleString()} - ${budgetRange.max.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="tender-footer">
          <div className="tender-timing">
            {status === 'Open' ? (
              <>
                <span className="closing-date">
                  Closes: {new Date(closingDate).toLocaleDateString()}
                </span>
                <span className={`days-remaining ${isClosingSoon() ? 'urgent' : ''}`}>
                  {daysRemaining()} days left
                </span>
              </>
            ) : (
              <span className="posted-date">
                Posted: {new Date(createdAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <Link 
            to={`/tender/${_id}`} 
            className={`btn ${status === 'Open' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {status === 'Open' ? 'Submit Bid' : 'View Details'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TenderCard;
