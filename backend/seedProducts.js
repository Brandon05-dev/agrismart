const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const sampleProducts = [
  {
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    description: 'Premium quality fresh tomatoes, perfect for cooking and salads. Grown organically without pesticides.',
    quantityAvailable: 500,
    unit: 'kg',
    unitPrice: 45,
    officialMarketPrice: 65,
    isAvailable: true
  },
  {
    name: 'Organic Carrots',
    category: 'Vegetables',
    description: 'Crispy, sweet organic carrots rich in vitamins. Freshly harvested from our farm.',
    quantityAvailable: 300,
    unit: 'kg',
    unitPrice: 50,
    officialMarketPrice: 70,
    isAvailable: true
  },
  {
    name: 'Green Cabbage',
    category: 'Vegetables',
    description: 'Fresh green cabbage, perfect for salads and cooking. High in fiber and nutrients.',
    quantityAvailable: 400,
    unit: 'kg',
    unitPrice: 30,
    officialMarketPrice: 45,
    isAvailable: true
  },
  {
    name: 'Red Apples',
    category: 'Fruits',
    description: 'Sweet and juicy red apples. Great for eating fresh or making juice. Rich in antioxidants.',
    quantityAvailable: 250,
    unit: 'kg',
    unitPrice: 80,
    officialMarketPrice: 110,
    isAvailable: true
  },
  {
    name: 'Bananas',
    category: 'Fruits',
    description: 'Fresh ripe bananas, naturally sweet. Perfect for breakfast or snacking. High in potassium.',
    quantityAvailable: 600,
    unit: 'kg',
    unitPrice: 35,
    officialMarketPrice: 50,
    isAvailable: true
  },
  {
    name: 'Sweet Oranges',
    category: 'Fruits',
    description: 'Juicy sweet oranges packed with Vitamin C. Great for fresh juice or eating.',
    quantityAvailable: 350,
    unit: 'kg',
    unitPrice: 55,
    officialMarketPrice: 75,
    isAvailable: true
  },
  {
    name: 'White Maize',
    category: 'Grains',
    description: 'High quality white maize grain. Perfect for ugali and other meals. Dried and cleaned.',
    quantityAvailable: 1000,
    unit: 'kg',
    unitPrice: 40,
    officialMarketPrice: 55,
    isAvailable: true
  },
  {
    name: 'Brown Rice',
    category: 'Grains',
    description: 'Nutritious brown rice, rich in fiber. Healthier alternative to white rice.',
    quantityAvailable: 800,
    unit: 'kg',
    unitPrice: 85,
    officialMarketPrice: 115,
    isAvailable: true
  },
  {
    name: 'Fresh Cow Milk',
    category: 'Dairy',
    description: 'Pure fresh cow milk from our dairy farm. Rich in calcium and proteins. Daily delivery available.',
    quantityAvailable: 200,
    unit: 'liter',
    unitPrice: 55,
    officialMarketPrice: 70,
    isAvailable: true
  },
  {
    name: 'Free Range Eggs',
    category: 'Poultry',
    description: 'Fresh free-range chicken eggs. Rich in proteins and nutrients. Collected daily.',
    quantityAvailable: 500,
    unit: 'dozen',
    unitPrice: 120,
    officialMarketPrice: 140,
    isAvailable: true
  }
];

const seedProducts = async () => {
  try {
    await connectDB();

    // Find a farmer user to assign products to
    let farmer = await User.findOne({ role: 'Farmer' });

    // If no farmer exists, create one
    if (!farmer) {
      console.log('No farmer found, creating sample farmer...');
      farmer = await User.create({
        username: 'demo_farmer',
        email: 'farmer@agrismart.com',
        password: 'password123', // This will be hashed by the pre-save hook
        role: 'Farmer',
        farmName: 'Green Valley Farm',
        phone: '+254712345678'
      });
      console.log('Sample farmer created');
    }

    // Clear existing products (optional)
    console.log('Clearing existing products...');
    await Product.deleteMany({});

    // Add farmer ID to all products
    const productsWithFarmer = sampleProducts.map(product => ({
      ...product,
      farmerId: farmer._id
    }));

    // Insert products
    console.log('Inserting sample products...');
    const insertedProducts = await Product.insertMany(productsWithFarmer);

    console.log(`✅ Successfully seeded ${insertedProducts.length} products!`);
    console.log('Sample products:');
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.category} - KES ${product.unitPrice}/${product.unit}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error.message);
    process.exit(1);
  }
};

seedProducts();
