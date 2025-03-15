import mongoose from 'mongoose';

// Function to generate order number
function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');

  // Format: BSM-ORD-YYMMDD-XXX
  return `BSM-ORD-${year}${month}${day}-${random}`;
}

interface IOrder extends mongoose.Document {
  orderId: string;
  userId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
  products: Array<{
    product: mongoose.Types.ObjectId;
    title: string;
    color?: string;
    size?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingMethod: 'air' | 'sea';
  deliveryType: 'door-to-door' | 'warehouse';
  paymentMethod:
    | 'bkash'
    | 'nogod'
    | 'rocket'
    | 'card'
    | 'bank-transfer'
    | 'cash';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';

  // Pricing details
  subtotal: number;
  shippingRate: number;
  totalDiscount: number;
  totalAmount: number;

  // Order status
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'in-transit'
    | 'out-for-delivery'
    | 'delivered'
    | 'canceled';

  // Tracking
  trackingNumber?: string;
  trackingHistory: Array<{
    status: string;
    timestamp: Date;
    location?: string;
    notes?: string;
  }>;

  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    default: generateOrderNumber,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      title: { type: String, required: true },
      color: String,
      size: String,
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true, min: 0 },
      subtotal: { type: Number, required: true, min: 0 },
    },
  ],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  shippingMethod: {
    type: String,
    enum: ['air', 'sea'],
    required: true,
  },
  deliveryType: {
    type: String,
    enum: ['door-to-door', 'warehouse'],
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank-transfer', 'cash'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },

  // Pricing details
  subtotal: { type: Number, required: true, min: 0 },
  shippingRate: { type: Number, required: true, min: 0 },
  totalDiscount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },

  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'in-transit',
      'out-for-delivery',
      'delivered',
      'canceled',
    ],
    default: 'pending',
  },

  trackingNumber: String,
  trackingHistory: [
    {
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      location: String,
      notes: String,
    },
  ],

  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for better query performance
orderSchema.index({ orderId: 1 }, { unique: true });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Update timestamp on save
orderSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Method to add tracking history
orderSchema.methods.addTrackingEvent = async function (
  status: string,
  location?: string,
  notes?: string
) {
  this.trackingHistory.push({
    status,
    timestamp: new Date(),
    location,
    notes,
  });

  // Update order status
  this.status = status;

  // If delivered, set actual delivery date
  if (status === 'delivered') {
    this.actualDeliveryDate = new Date();
  }

  await this.save();
};

const Order =
  mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
export default Order;
