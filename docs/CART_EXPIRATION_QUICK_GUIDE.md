# Cart Expiration - Quick Reference Guide

## What Was Implemented

Guest user carts now automatically expire after **24 hours** of inactivity.

## Key Features

✅ Automatic expiration after 24 hours  
✅ Visual notification when cart expires  
✅ Periodic background checks every minute  
✅ Logged-in users exempt (carts never expire)  
✅ Clear user messaging and education  

## Files Modified

### 1. `/frontend/src/context/CartContext.tsx`
- Added expiration logic to cart management
- Added periodic expiration checks
- Extended context with expiration-related functions

### 2. `/frontend/src/pages/Cart.tsx`
- Added expiration notice banner
- Added user notification handling
- Updated guest user messaging

### 3. `/frontend/src/pages/Cart.css`
- Added styles for expiration notice
- Implemented animations
- Added responsive design for mobile

## Quick Test

To test expiration without waiting 24 hours:

```javascript
// In browser console:
const cart = JSON.parse(localStorage.getItem('agrismart_cart'));
cart.expiresAt = Date.now() - 1000;
localStorage.setItem('agrismart_cart', JSON.stringify(cart));
location.reload();
```

## Configuration

Change expiration time in `CartContext.tsx`:

```typescript
const CART_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours
```

## API Reference

### New Context Functions

```typescript
// Check if cart has expired
cartExpired: boolean

// Clear the expiration flag after showing notification
clearCartExpiredFlag(): void

// Get expiration timestamp for guest carts
getCartExpirationTime(): number | null
```

## User Experience Flow

```
Guest User Adds Items
        ↓
Cart Saved with Expiration (24h)
        ↓
    Time Passes
        ↓
   Cart Expires
        ↓
User Visits Cart Page
        ↓
Sees Expiration Notice
        ↓
Cart is Empty, Can Add Items Again
```

## Important Notes

- Only guest (non-logged-in) users have expiring carts
- Logged-in users' carts persist indefinitely in the database
- Expiration time resets every time cart is updated
- localStorage is automatically cleaned when cart expires
- Notice auto-dismisses after 10 seconds

## Support for Different Scenarios

| Scenario | Behavior |
|----------|----------|
| Guest adds items | Cart expires in 24h |
| Guest updates cart | Expiration resets to 24h from now |
| User logs in | Cart moves to database, no expiration |
| User logs out | Future cart items subject to 24h expiration |
| User closes browser | Cart persists until expiration time |

## Troubleshooting

### Cart not expiring in tests
- Check localStorage expiration timestamp is in the past
- Ensure you're testing as a guest (logged out)
- Wait up to 1 minute for periodic check to trigger

### Notice not showing
- Check `cartExpired` flag in React DevTools
- Verify Cart.tsx is properly consuming `useCart()` hook
- Check browser console for errors

### Expiration too short/long
- Adjust `CART_EXPIRATION_TIME` constant
- Value is in milliseconds
- Clear localStorage and refresh to apply new time

## Related Documentation

See `CART_EXPIRATION.md` for detailed implementation documentation.
