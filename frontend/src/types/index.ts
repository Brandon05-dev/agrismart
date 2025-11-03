// User types
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'Farmer' | 'Buyer' | 'Admin';
  farmName?: string;
  organizationName?: string;
  organizationType?: 'Company' | 'Institution' | 'School' | 'Hospital' | 'Restaurant' | 'Hotel' | 'Other';
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

// Cart types
export interface CartItem {
  _id?: string;
  productId: string | Product;
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  imageUrl?: string;
  farmerId?: User | string;
  subtotal: number;
}

export interface Cart {
  _id?: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  updatedAt?: string;
}

// Tender types
export interface TenderRequirement {
  productCategory: string;
  productName: string;
  quantity: number;
  unit: string;
  qualityStandards?: string;
}

export interface DeliverySchedule {
  startDate: string;
  endDate: string;
  frequency?: 'One-time' | 'Weekly' | 'Monthly' | 'Quarterly';
}

export interface Tender {
  _id: string;
  title: string;
  description: string;
  buyerId: User | string;
  requirements: TenderRequirement[];
  deliveryLocation: string;
  deliverySchedule: DeliverySchedule;
  budgetRange: {
    min: number;
    max: number;
  };
  closingDate: string;
  status: 'Open' | 'Closed' | 'Awarded' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

// Bid types
export interface Bid {
  _id: string;
  tenderId: string | Tender;
  farmerId: User | string;
  proposedPrice: number;
  deliveryTerms: string;
  qualityCertificates?: string[];
  farmerNotes?: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Withdrawn';
  submittedAt: string;
}

// Order types (for awarded tenders)
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
  tenderId?: string;
  bidId?: string;
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
  organizationName?: string;
  organizationType?: string;
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
