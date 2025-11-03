import React, { useState, useEffect } from 'react';
import OTPInput from './OTPInput';
import './OTPModal.css';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  destination: string;
  method: 'email' | 'phone';
}

const OTPModal: React.FC<OTPModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  onResend,
  destination,
  method
}) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (isOpen && resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [isOpen, resendTimer]);

  useEffect(() => {
    if (isOpen) {
      setOtp('');
      setError('');
      setResendTimer(60);
      setCanResend(false);
    }
  }, [isOpen]);

  const handleOTPComplete = async (otpValue: string) => {
    setOtp(otpValue);
    setError('');
    setIsVerifying(true);

    try {
      await onVerify(otpValue);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setError('');
    setCanResend(false);
    setResendTimer(60);

    try {
      await onResend();
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
      setCanResend(true);
    }
  };

  const handleClose = () => {
    if (!isVerifying) {
      onClose();
    }
  };

  const maskDestination = (dest: string) => {
    if (method === 'email') {
      const [username, domain] = dest.split('@');
      const maskedUsername = username.slice(0, 2) + '***' + username.slice(-1);
      return `${maskedUsername}@${domain}`;
    } else {
      return dest.slice(0, 3) + '***' + dest.slice(-4);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="otp-modal-overlay" onClick={handleClose}>
      <div className="otp-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="otp-modal-close" 
          onClick={handleClose}
          disabled={isVerifying}
        >
          &times;
        </button>

        <div className="otp-modal-content">
          <div className="otp-modal-icon">
            {method === 'email' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          <h2 className="otp-modal-title">Verify Your Account</h2>
          
          <p className="otp-modal-description">
            We've sent a 6-digit verification code to your {method}:
          </p>
          
          <p className="otp-modal-destination">
            {maskDestination(destination)}
          </p>

          <OTPInput
            length={6}
            onComplete={handleOTPComplete}
            onChange={setOtp}
            disabled={isVerifying}
          />

          {error && (
            <div className="otp-modal-error">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {isVerifying && (
            <div className="otp-modal-loading">
              <div className="otp-modal-spinner"></div>
              <span>Verifying...</span>
            </div>
          )}

          <div className="otp-modal-footer">
            <p className="otp-modal-resend-text">
              Didn't receive the code?{' '}
              {canResend ? (
                <button 
                  className="otp-modal-resend-button" 
                  onClick={handleResend}
                  disabled={isVerifying}
                >
                  Resend Code
                </button>
              ) : (
                <span className="otp-modal-timer">
                  Resend in {resendTimer}s
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
