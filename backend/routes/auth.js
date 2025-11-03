const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOTP, sendOTP, verifyOTP } = require('../services/otpService');
const { verifyGoogleToken, extractGoogleUserInfo } = require('../services/googleAuthService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user (Farmer or Buyer) - Initial registration without OTP
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, farmName, phone, address } = req.body;

    // Validation - at least email or phone required
    if (!username) {
      return res.status(400).json({ 
        success: false,
        message: 'Username is required' 
      });
    }

    if (!email && !phone) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide either email or phone number' 
      });
    }

    if (!password) {
      return res.status(400).json({ 
        success: false,
        message: 'Password is required for email/phone registration' 
      });
    }

    // Check if role is Farmer and farmName is provided
    if (role === 'Farmer' && !farmName) {
      return res.status(400).json({ 
        success: false,
        message: 'Farm name is required for Farmer registration' 
      });
    }

    // Check if user already exists
    const query = [];
    if (email) query.push({ email });
    if (phone) query.push({ phone });
    query.push({ username });

    const existingUser = await User.findOne({ $or: query });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email, phone, or username already exists' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create new user (not verified yet)
    const user = await User.create({
      username,
      email: email || undefined,
      phone: phone || undefined,
      password,
      role: role || 'Buyer',
      farmName: role === 'Farmer' ? farmName : undefined,
      address,
      otpCode: otp,
      otpExpiry: otpExpiry,
      verified: false
    });

    // Send OTP
    try {
      await sendOTP({ email, phone, otp });
    } catch (otpError) {
      console.error('Error sending OTP:', otpError);
      // Delete user if OTP sending fails
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to send verification code. Please try again.',
        error: otpError.message 
      });
    }

    res.status(201).json({
      success: true,
      message: 'User registered. Please verify your OTP.',
      data: {
        userId: user._id,
        method: email ? 'email' : 'phone',
        destination: email || phone,
        requiresVerification: true
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error registering user',
      error: error.message 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user with email/phone and password
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Validation
    if ((!email && !phone) || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email or phone and password' 
      });
    }

    // Find user by email or phone
    const query = email ? { email } : { phone };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check if user has password (not OAuth user)
    if (!user.password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please login with Google or request an OTP' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check if user is verified
    if (!user.verified) {
      return res.status(403).json({ 
        success: false,
        message: 'Please verify your account first',
        requiresVerification: true,
        userId: user._id
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          farmName: user.farmName,
          verified: user.verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error logging in',
      error: error.message 
    });
  }
});

// @route   POST /api/auth/send-otp
// @desc    Send OTP to email or phone
// @access  Public
router.post('/send-otp', async (req, res) => {
  try {
    const { email, phone, userId } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email or phone number' 
      });
    }

    // Find user
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else {
      const query = email ? { email } : { phone };
      user = await User.findOne(query);
    }

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Update user with new OTP
    user.otpCode = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP
    try {
      const result = await sendOTP({ 
        email: email || user.email, 
        phone: phone || user.phone, 
        otp 
      });

      res.status(200).json({
        success: true,
        message: `OTP sent successfully to ${email ? 'email' : 'phone'}`,
        data: {
          userId: user._id,
          method: email || user.email ? 'email' : 'phone',
          destination: email || phone || user.email || user.phone
        }
      });
    } catch (otpError) {
      console.error('Error sending OTP:', otpError);
      res.status(500).json({ 
        success: false,
        message: 'Failed to send OTP. Please try again.',
        error: otpError.message 
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error sending OTP',
      error: error.message 
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and activate user account
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp, email, phone } = req.body;

    if (!otp) {
      return res.status(400).json({ 
        success: false,
        message: 'OTP is required' 
      });
    }

    // Find user
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email || phone) {
      const query = email ? { email } : { phone };
      user = await User.findOne(query);
    } else {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide userId, email, or phone' 
      });
    }

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Verify OTP
    const verification = verifyOTP(otp, user.otpCode, user.otpExpiry);

    if (!verification.valid) {
      return res.status(400).json({ 
        success: false,
        message: verification.message 
      });
    }

    // Mark user as verified and clear OTP
    user.verified = true;
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          farmName: user.farmName,
          verified: user.verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error verifying OTP',
      error: error.message 
    });
  }
});

// @route   POST /api/auth/google
// @desc    Google OAuth login/signup
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { token, role, farmName } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false,
        message: 'Google token is required' 
      });
    }

    // Verify Google token
    const { payload } = await verifyGoogleToken(token);
    const googleInfo = extractGoogleUserInfo(payload);

    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { googleId: googleInfo.googleId },
        { email: googleInfo.email }
      ]
    });

    if (user) {
      // User exists - login
      // Update googleId if not set
      if (!user.googleId) {
        user.googleId = googleInfo.googleId;
        user.verified = true;
        await user.save();
      }
    } else {
      // New user - signup
      // Check if role is Farmer and farmName is provided
      if (role === 'Farmer' && !farmName) {
        return res.status(400).json({ 
          success: false,
          message: 'Farm name is required for Farmer registration' 
        });
      }

      user = await User.create({
        username: googleInfo.username,
        email: googleInfo.email,
        googleId: googleInfo.googleId,
        role: role || 'Buyer',
        farmName: role === 'Farmer' ? farmName : undefined,
        verified: true // Google accounts are pre-verified
      });
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: user.createdAt.getTime() === user.updatedAt.getTime() ? 'Account created successfully' : 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          farmName: user.farmName,
          verified: user.verified
        },
        token: jwtToken
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error with Google authentication',
      error: error.message 
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user',
      error: error.message 
    });
  }
});

module.exports = router;
