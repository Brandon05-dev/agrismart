// User types
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'Farmer' | 'Buyer' | 'Admin';
  farmName?: string;
  phone?: string;
  createdAt: string;
}

// Product types
export interface Product {
  _id: string;
  name: string;
  description?: string;
  category: string;
  unitPrice: number;
  unit: string;
  officialMarketPrice: number;
  priceTransparencyMetric: number;
  quantityAvailable: number;
  imageUrl?: string;
  farmerId: User | string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  unitPrice: string;
  unit: string;
  quantityAvailable: string;
  imageUrl: string;
}

// Order types
export interface OrderProduct {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  _id: string;
  buyerId: User | string;
  farmerId: User | string;
  products: OrderProduct[];
  totalAmount: number;
  farmerTotal: number;
  platformFee: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: ShippingAddress;
  orderDate: string;
  deliveryDate?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'Farmer' | 'Buyer';
  farmName?: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Dashboard types
export interface FarmerStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    orderDate: string;
    status: string;
    totalAmount: number;
  }>;
}

export interface SalesStatistics {
  totalSales: number;
  totalOrders: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
