# 🌾 AgriSmart - Farmers Marketplace Platform

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green.svg)](https://www.mongodb.com/mern-stack)
[![Status](https://img.shields.io/badge/Status-Complete-success.svg)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)]()

> A complete MERN stack marketplace connecting farmers directly with buyers, featuring automated price transparency to eliminate middlemen and ensure fair pricing for all parties.

AgriSmart is a direct-to-consumer/business marketplace that connects farmers with buyers, emphasizing price transparency to eliminate the loss of revenue to middlemen. This platform contributes to **UN SDG 2** (Zero Hunger) and **SDG 8** (Decent Work and Economic Growth).

## 📊 Project Stats

- **Lines of Code**: 4,386+
- **Files**: 50+
- **Components**: 16
- **API Endpoints**: 20+
- **Database Models**: 3

## 🌟 Features

### For Farmers
- **Product Listings**: Create and manage product listings with ease
- **Inventory Management**: Track available products and quantities
- **Sales Dashboard**: View sales history and revenue statistics
- **Price Transparency**: Compare your prices against market rates
- **Order Management**: Track and manage incoming orders

### For Buyers
- **Marketplace**: Browse fresh products directly from farmers
- **Price Comparison**: See farmer prices vs. official market prices
- **Search & Filter**: Find products by category, price, and more
- **Direct Ordering**: Purchase directly from farmers with no middlemen
- **Order History**: Track your purchases and deliveries

### Core Technology
- **Frontend**: React.js with React Router
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **Price Engine**: Automated market price updates with node-cron

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas account)

## 🚀 Quick Start

### Automated Setup (Recommended)
```bash
# Make setup script executable and run
chmod +x setup.sh
./setup.sh
```

### Manual Setup

#### 1. Backend Setup
```bash
cd backend
npm install

# Configure .env file:
# MONGO_URI=mongodb://localhost:27017/agrismart
# JWT_SECRET=your_secure_secret_key
# PORT=5000
# NODE_ENV=development

npm run dev  # Starts on http://localhost:5000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm start    # Starts on http://localhost:3000
```

#### 3. Initial Data Setup
```bash
# Trigger market price update
curl -X POST http://localhost:5000/api/admin/update-prices
```

### Test Accounts

**Create a Farmer:**
```json
POST /api/auth/register
{
  "username": "farmerjohn",
  "email": "farmer@example.com",
  "password": "password123",
  "role": "Farmer",
  "farmName": "Green Valley Farm"
}
```

**Create a Buyer:**
```json
POST /api/auth/register
{
  "username": "buyer1",
  "email": "buyer@example.com",
  "password": "password123",
  "role": "Buyer"
}
```

## 🗄️ Database Setup

### Local MongoDB
1. Install MongoDB on your system
2. Start MongoDB service:
   ```bash
   sudo systemctl start mongod
   ```
3. Update `MONGO_URI` in `.env` to:
   ```
   MONGO_URI=mongodb://localhost:27017/agrismart
   ```

### MongoDB Atlas (Cloud)
1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGO_URI` in `.env` with your Atlas connection string

## 📁 Project Structure

```
AgriSmart/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── middleware/
│   │   └── auth.js               # Authentication middleware
│   ├── models/
│   │   ├── User.js               # User schema (Farmer/Buyer)
│   │   ├── Product.js            # Product schema
│   │   └── Order.js              # Order schema
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── product.js            # Product routes
│   │   ├── farmer.js             # Farmer-specific routes
│   │   ├── order.js              # Order routes
│   │   └── admin.js              # Admin/price update routes
│   ├── services/
│   │   └── priceService.js       # Price transparency engine
│   ├── .env                      # Environment variables
│   ├── package.json
│   └── server.js                 # Main server file
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js         # Navigation header
│   │   │   ├── ProductCard.js    # Product display card
│   │   │   └── ProtectedRoute.js # Route protection
│   │   ├── context/
│   │   │   └── AuthContext.js    # Authentication context
│   │   ├── pages/
│   │   │   ├── Home.js           # Landing page
│   │   │   ├── Login.js          # Login page
│   │   │   ├── Register.js       # Registration page
│   │   │   ├── Marketplace.js    # Product marketplace
│   │   │   ├── FarmerDashboard.js    # Farmer dashboard
│   │   │   ├── NewListingForm.js     # Add product form
│   │   │   ├── InventoryTable.js     # Inventory management
│   │   │   └── SalesHistory.js       # Sales history
│   │   ├── utils/
│   │   │   └── api.js            # Axios configuration
│   │   ├── App.js                # Main app component
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Farmer only)
- `PUT /api/products/:id` - Update product (Farmer only)
- `DELETE /api/products/:id` - Delete product (Farmer only)

### Farmer Routes
- `GET /api/farmer/inventory` - Get farmer's products
- `GET /api/farmer/sales` - Get sales history
- `GET /api/farmer/dashboard-stats` - Get dashboard statistics

### Orders
- `POST /api/orders` - Create order (Buyer only)
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status

### Admin/Price Updates
- `POST /api/admin/update-prices` - Trigger price update
- `GET /api/admin/transparency-stats` - Get transparency stats
- `GET /api/admin/price-comparison/:productId` - Compare prices

## 🎨 User Roles

### Farmer
- Create and manage product listings
- View inventory and sales
- Track revenue and orders
- Set competitive prices

### Buyer
- Browse marketplace
- Compare prices with market rates
- Place orders directly
- Track order history

## 🔄 Price Transparency Engine

The platform includes an automated price transparency system:

1. **Mock Market Prices**: Simulated commodity exchange data for common agricultural products
2. **Scheduled Updates**: Daily updates at 2:00 AM via node-cron
3. **Transparency Metrics**: Percentage comparison showing price differences
4. **Visual Indicators**: Clear display of savings vs. market prices

### How It Works
- Products are compared against official market prices
- Price transparency metric calculated: `((farmerPrice - marketPrice) / marketPrice) * 100`
- Green indicators show below-market prices (savings for buyers)
- Orange indicators show above-market prices

## 🧪 Testing the Application

### 1. Register a Farmer Account
- Go to Register page
- Choose "Farmer" role
- Provide farm name
- Complete registration

### 2. Create Product Listings
- Navigate to Farmer Dashboard
- Click "Add New Product"
- Fill in product details
- Submit listing

### 3. Register a Buyer Account
- Use a different browser/incognito window
- Register as "Buyer"
- Browse marketplace
- View products and price comparisons

### 4. Test Price Transparency
- After products are created, trigger price update:
  ```bash
  curl -X POST http://localhost:5000/api/admin/update-prices
  ```
- Refresh marketplace to see updated transparency metrics

## 🛠️ Development Scripts

### Backend
```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
```

### Frontend
```bash
npm start        # Start development server
npm run build    # Create production build
npm test         # Run tests
```

## 🌍 Contributing to SDGs

This platform directly contributes to:

- **SDG 2 (Zero Hunger)**: Improving food supply chains and farmer livelihoods
- **SDG 8 (Decent Work)**: Ensuring fair compensation for farmers and eliminating exploitative middlemen

## 📝 Future Enhancements

- Real-time commodity exchange API integration
- Payment gateway integration
- Mobile app development
- Rating and review system
- Advanced analytics dashboard
- Multi-language support
- Image upload functionality
- Real-time chat between farmers and buyers

## 🤝 Support

For issues, questions, or contributions, please create an issue in the repository.

## 📄 License

MIT License

---

**Built with ❤️ for farmers and sustainable agriculture**
