const nodemailer = require('nodemailer');
const AfricasTalking = require('africastalking');
const twilio = require('twilio');

/**
 * Generate a 6-digit OTP code
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Configure nodemailer transporter
 */
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Send OTP via Email using Nodemailer
 * @param {string} email - Recipient email address
 * @param {string} otp - OTP code to send
 * @returns {Promise<Object>} - Result of email send operation
 */
const sendOTPByEmail = async (email, otp) => {
  try {
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: `"AgriSmart Marketplace" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your AgriSmart Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .otp-box { background-color: white; border: 2px dashed #10b981; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>AgriSmart Marketplace</h1>
            </div>
            <div class="content">
              <h2>Verification Code</h2>
              <p>Hello!</p>
              <p>Thank you for registering with AgriSmart Marketplace. Please use the following verification code to complete your registration:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p><strong>This code will expire in 5 minutes.</strong></p>
              <p>If you didn't request this code, please ignore this email.</p>
              <p>Best regards,<br/>The AgriSmart Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} AgriSmart Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Your AgriSmart verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this email.`
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'OTP sent successfully via email'
    };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

/**
 * Send OTP via SMS using Africa's Talking
 * @param {string} phoneNumber - Recipient phone number (international format)
 * @param {string} otp - OTP code to send
 * @returns {Promise<Object>} - Result of SMS send operation
 */
const sendOTPByAfricasTalking = async (phoneNumber, otp) => {
  try {
    const apiKey = process.env.AFRICASTALKING_API_KEY;
    const username = process.env.AFRICASTALKING_USERNAME;

    if (!apiKey || !username) {
      throw new Error('Africa\'s Talking credentials not configured');
    }

    const africasTalking = AfricasTalking({
      apiKey: apiKey,
      username: username
    });

    const sms = africasTalking.SMS;
    
    const message = `Your AgriSmart verification code is: ${otp}\n\nThis code will expire in 5 minutes.`;

    const result = await sms.send({
      to: [phoneNumber],
      message: message,
      from: process.env.AFRICASTALKING_SENDER_ID || 'AgriSmart'
    });

    return {
      success: true,
      result: result.SMSMessageData.Recipients,
      message: 'OTP sent successfully via SMS (Africa\'s Talking)'
    };
  } catch (error) {
    console.error('Error sending OTP via Africa\'s Talking:', error);
    throw new Error(`Failed to send OTP SMS: ${error.message}`);
  }
};

/**
 * Send OTP via SMS using Twilio
 * @param {string} phoneNumber - Recipient phone number (international format)
 * @param {string} otp - OTP code to send
 * @returns {Promise<Object>} - Result of SMS send operation
 */
const sendOTPByTwilio = async (phoneNumber, otp) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio credentials not configured');
    }

    const client = twilio(accountSid, authToken);
    
    const message = `Your AgriSmart verification code is: ${otp}\n\nThis code will expire in 5 minutes.`;

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: phoneNumber
    });

    return {
      success: true,
      sid: result.sid,
      message: 'OTP sent successfully via SMS (Twilio)'
    };
  } catch (error) {
    console.error('Error sending OTP via Twilio:', error);
    throw new Error(`Failed to send OTP SMS: ${error.message}`);
  }
};

/**
 * Send OTP via SMS (tries Africa's Talking first, falls back to Twilio)
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} otp - OTP code to send
 * @returns {Promise<Object>} - Result of SMS send operation
 */
const sendOTPBySMS = async (phoneNumber, otp) => {
  const smsProvider = process.env.SMS_PROVIDER || 'africastalking';

  try {
    if (smsProvider === 'twilio') {
      return await sendOTPByTwilio(phoneNumber, otp);
    } else {
      return await sendOTPByAfricasTalking(phoneNumber, otp);
    }
  } catch (error) {
    console.error(`Error with ${smsProvider}:`, error.message);
    
    // Try fallback provider
    if (smsProvider === 'africastalking') {
      console.log('Trying Twilio as fallback...');
      return await sendOTPByTwilio(phoneNumber, otp);
    } else {
      console.log('Trying Africa\'s Talking as fallback...');
      return await sendOTPByAfricasTalking(phoneNumber, otp);
    }
  }
};

/**
 * Send OTP to email or phone
 * @param {Object} params - Parameters object
 * @param {string} params.email - Email address (optional)
 * @param {string} params.phone - Phone number (optional)
 * @param {string} params.otp - OTP code to send
 * @returns {Promise<Object>} - Result of send operation
 */
const sendOTP = async ({ email, phone, otp }) => {
  if (email) {
    return await sendOTPByEmail(email, otp);
  } else if (phone) {
    return await sendOTPBySMS(phone, otp);
  } else {
    throw new Error('Either email or phone number is required');
  }
};

/**
 * Verify if OTP is valid and not expired
 * @param {string} providedOTP - OTP provided by user
 * @param {string} storedOTP - OTP stored in database
 * @param {Date} otpExpiry - OTP expiry time
 * @returns {Object} - Verification result
 */
const verifyOTP = (providedOTP, storedOTP, otpExpiry) => {
  if (!storedOTP || !otpExpiry) {
    return {
      valid: false,
      message: 'No OTP found. Please request a new one.'
    };
  }

  if (new Date() > otpExpiry) {
    return {
      valid: false,
      message: 'OTP has expired. Please request a new one.'
    };
  }

  if (providedOTP !== storedOTP) {
    return {
      valid: false,
      message: 'Invalid OTP. Please try again.'
    };
  }

  return {
    valid: true,
    message: 'OTP verified successfully'
  };
};

module.exports = {
  generateOTP,
  sendOTP,
  sendOTPByEmail,
  sendOTPBySMS,
  verifyOTP
};
