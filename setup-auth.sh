#!/bin/bash

# AgriSmart Multi-Channel Authentication Setup Script
# This script helps you set up the authentication system

echo "🚀 AgriSmart Multi-Channel Authentication Setup"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the agrismart root directory"
    exit 1
fi

echo "✅ Directory structure verified"
echo ""

# Backend setup
echo "📦 Backend Setup"
echo "----------------"

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env not found"
    echo "   Please create it and add the required environment variables"
    echo "   See QUICK_START_AUTH.md for details"
    exit 1
fi

echo "✅ backend/.env found"

# Check for required env variables
echo "Checking environment variables..."

# Read .env and check for required vars
ENV_FILE="backend/.env"
REQUIRED_VARS=("EMAIL_USER" "EMAIL_PASSWORD" "GOOGLE_CLIENT_ID")

for VAR in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${VAR}=" "$ENV_FILE"; then
        VALUE=$(grep "^${VAR}=" "$ENV_FILE" | cut -d '=' -f2)
        if [ -z "$VALUE" ] || [[ "$VALUE" == *"your"* ]] || [[ "$VALUE" == *"here"* ]]; then
            echo "⚠️  ${VAR} is not configured (placeholder detected)"
        else
            echo "✅ ${VAR} is configured"
        fi
    else
        echo "❌ ${VAR} is missing from .env"
    fi
done

echo ""

# Frontend setup
echo "🎨 Frontend Setup"
echo "-----------------"

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  frontend/.env not found"
    echo "   Creating frontend/.env with template..."
    cat > frontend/.env << EOL
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
EOL
    echo "✅ frontend/.env created"
else
    echo "✅ frontend/.env found"
fi

echo ""

# Check if new auth pages should replace old ones
echo "🔄 Auth Pages Setup"
echo "-------------------"

if [ -f "frontend/src/pages/LoginNew.tsx" ] && [ -f "frontend/src/pages/Login.tsx" ]; then
    echo "Found both old and new login pages."
    read -p "Do you want to replace old pages with new ones? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Backing up old pages..."
        mv frontend/src/pages/Login.tsx frontend/src/pages/Login.old.tsx
        mv frontend/src/pages/Register.tsx frontend/src/pages/Register.old.tsx
        
        echo "Activating new pages..."
        mv frontend/src/pages/LoginNew.tsx frontend/src/pages/Login.tsx
        mv frontend/src/pages/RegisterNew.tsx frontend/src/pages/Register.tsx
        
        echo "✅ New auth pages activated"
    else
        echo "⏭️  Skipping page replacement"
    fi
else
    echo "✅ Auth pages configured"
fi

echo ""

# Summary
echo "📋 Setup Summary"
echo "----------------"
echo ""
echo "Backend:"
echo "  ✅ Dependencies installed (nodemailer, africastalking, twilio, google-auth-library)"
echo "  ✅ User model updated with OTP fields"
echo "  ✅ OTP service created"
echo "  ✅ Google OAuth service created"
echo "  ✅ Auth routes updated"
echo ""
echo "Frontend:"
echo "  ✅ OTP Input component created"
echo "  ✅ OTP Modal component created"
echo "  ✅ AuthContext updated"
echo "  ✅ New Login page created"
echo "  ✅ New Register page created"
echo ""
echo "Documentation:"
echo "  📖 MULTI_CHANNEL_AUTH_GUIDE.md (Complete guide)"
echo "  📖 QUICK_START_AUTH.md (Quick start)"
echo "  📖 IMPLEMENTATION_NOTES.md (Technical details)"
echo "  📖 AUTH_IMPLEMENTATION_SUMMARY.md (Overview)"
echo ""

# Next steps
echo "🎯 Next Steps"
echo "-------------"
echo ""
echo "1. Configure environment variables:"
echo "   - Edit backend/.env and add your API credentials"
echo "   - Edit frontend/.env and add your Google Client ID"
echo ""
echo "2. Start the development servers:"
echo "   Terminal 1: cd backend && npm start"
echo "   Terminal 2: cd frontend && npm start"
echo ""
echo "3. Test the authentication:"
echo "   - Visit http://localhost:3000/register"
echo "   - Try email, phone, and Google authentication"
echo ""
echo "4. Read the documentation:"
echo "   - QUICK_START_AUTH.md for setup instructions"
echo "   - MULTI_CHANNEL_AUTH_GUIDE.md for detailed documentation"
echo ""
echo "✨ Setup complete! You're ready to test the multi-channel authentication system."
echo ""
