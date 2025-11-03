# Cart Expiration Feature

## Overview

The cart expiration feature has been implemented to automatically expire guest user carts after 24 hours of inactivity. This ensures that product availability remains accurate and prevents stale cart data from accumulating in localStorage.

## Features

### 1. **Automatic Expiration**
- Guest carts expire after **24 hours** from the last update
- Expiration time is stored in localStorage along with cart data
- Carts are checked for expiration on page load and periodically every minute

### 2. **Visual Feedback**
- When a cart expires, a prominent notification banner appears at the top of the cart page
- The notification includes:
  - An icon (⏰) for visual recognition
  - A clear explanation of what happened
  - Information about why carts expire
  - Suggestion to login/register for permanent cart storage
- The notification auto-dismisses after 10 seconds but can be manually closed

### 3. **User Education**
- Guest cart notice in the cart summary now mentions the 24-hour expiration
- Encourages users to login or register to save their cart permanently

### 4. **Logged-in Users**
- Logged-in users' carts are stored in the database and **do not expire**
- No expiration checks are performed for authenticated users
- Carts persist indefinitely until manually cleared or checked out

## Technical Implementation

### Frontend Changes

#### 1. **CartContext.tsx**
- Added `CART_EXPIRATION_TIME` constant (24 hours in milliseconds)
- Extended cart interface with `expiresAt` timestamp
- Added `cartExpired` state to track expiration status
- Added `clearCartExpiredFlag()` function to reset expiration flag
- Added `getCartExpirationTime()` function to retrieve expiration timestamp
- Modified `loadLocalCart()` to check expiration and clear expired carts
- Modified `saveLocalCart()` to add expiration timestamp to stored data
- Added periodic check (every minute) for cart expiration

#### 2. **Cart.tsx**
- Added `showExpirationNotice` state for controlling notification visibility
- Added effect to show notification when cart expires
- Added auto-dismiss timer (10 seconds)
- Added expiration notice banner with close button
- Updated guest notice to mention 24-hour expiration

#### 3. **Cart.css**
- Added styles for expiration notice banner
- Implemented slide-down animation for notice appearance
- Added responsive styles for mobile devices
- Styled close button with hover effects

### Data Structure

```typescript
interface StoredCart extends Cart {
  expiresAt?: number; // Unix timestamp in milliseconds
}
```

Example stored cart in localStorage:
```json
{
  "userId": "guest",
  "items": [...],
  "totalItems": 3,
  "totalAmount": 45.50,
  "expiresAt": 1699132800000
}
```

## User Flow

### Guest User
1. User adds items to cart → Cart saved with expiration timestamp
2. User continues shopping → Expiration timestamp updates with each cart modification
3. After 24 hours → Cart automatically expires
4. User visits cart page → Sees expiration notice, cart is empty
5. User can add items again or login to prevent future expirations

### Logged-in User
1. User adds items to cart → Cart saved to database (no expiration)
2. Cart persists indefinitely
3. Cart syncs across devices
4. No expiration warnings or checks

## Configuration

To modify the expiration time, update the constant in `CartContext.tsx`:

```typescript
// Current: 24 hours
const CART_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

// Examples:
// 12 hours: 12 * 60 * 60 * 1000
// 48 hours: 48 * 60 * 60 * 1000
// 7 days: 7 * 24 * 60 * 60 * 1000
```

## Testing

### Test Scenarios

1. **Basic Expiration**
   - Add items to cart as guest
   - Wait or manually modify localStorage expiration time to past
   - Reload page
   - Verify cart is cleared and notice appears

2. **Periodic Check**
   - Add items to cart as guest
   - Keep page open
   - Modify localStorage expiration to past
   - Wait up to 1 minute
   - Verify cart clears automatically and notice appears

3. **Notice Interaction**
   - Trigger cart expiration
   - Verify notice appears
   - Click close button → Notice disappears
   - Reload page → Notice should not reappear

4. **Auto-dismiss**
   - Trigger cart expiration
   - Wait 10 seconds
   - Verify notice auto-dismisses

5. **Logged-in User**
   - Login as user
   - Add items to cart
   - Verify no expiration timestamp in cart data
   - Wait indefinitely → Cart should not expire

## Manual Testing

To manually test expiration without waiting 24 hours:

1. Open browser Developer Tools
2. Go to Application/Storage → Local Storage
3. Find `agrismart_cart` key
4. Modify the `expiresAt` value to a past timestamp:
   ```javascript
   // In console:
   const cart = JSON.parse(localStorage.getItem('agrismart_cart'));
   cart.expiresAt = Date.now() - 1000; // 1 second ago
   localStorage.setItem('agrismart_cart', JSON.stringify(cart));
   // Then reload the page or wait up to 1 minute
   ```

## Benefits

1. **Data Accuracy**: Prevents stale cart data with outdated product availability
2. **User Experience**: Clear communication about why carts expire
3. **Encourages Registration**: Motivates users to create accounts for persistent carts
4. **Storage Management**: Automatically cleans up old guest cart data
5. **Fairness**: Ensures products aren't held indefinitely by inactive guests

## Future Enhancements

Possible improvements for the future:

1. **Configurable Expiration**: Allow admins to set expiration time via dashboard
2. **Warning Notifications**: Show warning before cart expires (e.g., "Cart expires in 1 hour")
3. **Email Reminders**: For logged-in users, send email if cart has items for X days
4. **Extended Expiration**: Offer longer expiration for users who verify email
5. **Activity-based Expiration**: Reset expiration on any site activity, not just cart updates
6. **Analytics**: Track cart expiration metrics for business insights

## Browser Compatibility

The feature uses standard Web APIs:
- `localStorage`: Supported in all modern browsers
- `Date.now()`: Supported in all modern browsers
- `setInterval`: Supported in all browsers

No polyfills required.

## Performance Considerations

- **localStorage Access**: Minimal overhead, only accessed on cart operations and periodic checks
- **Periodic Check**: Runs every 60 seconds, negligible performance impact
- **State Updates**: Only triggers re-render when expiration actually occurs
- **Memory**: Minimal additional memory usage for expiration timestamp

## Security Considerations

- Cart data is stored client-side, same security as before
- No sensitive information in expiration timestamp
- Server-side validation still required on checkout
- Product availability re-checked server-side before purchase
