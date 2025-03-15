import mongoose from 'mongoose';

interface ICustomer extends mongoose.Document {
  userId: string;
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
  orders: mongoose.Types.ObjectId[];
  status: 'active' | 'inactive' | 'blocked';
  customerType: 'regular' | 'wholesale' | 'vip';
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
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
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active',
  },
  customerType: {
    type: String,
    enum: ['regular', 'wholesale', 'vip'],
    default: 'regular',
  },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: Date,
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for better query performance
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ customerType: 1 });

// Update timestamp on save
customerSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Customer =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>('Customer', customerSchema);
export default Customer;
