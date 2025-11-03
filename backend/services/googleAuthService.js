const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID token
 * @param {string} token - Google ID token from frontend
 * @returns {Promise<Object>} - Payload containing user info
 */
const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    return {
      success: true,
      payload: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified
      }
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid Google token');
  }
};

/**
 * Extract user information from Google payload
 * @param {Object} payload - Google token payload
 * @returns {Object} - Formatted user information
 */
const extractGoogleUserInfo = (payload) => {
  return {
    googleId: payload.sub || payload.googleId,
    email: payload.email,
    username: payload.name || payload.email.split('@')[0],
    verified: payload.email_verified || payload.emailVerified || true,
    profilePicture: payload.picture
  };
};

module.exports = {
  verifyGoogleToken,
  extractGoogleUserInfo
};
