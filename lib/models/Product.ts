import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxLength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [2000, 'Description cannot exceed 2000 characters'],
    },
    media: [
      {
        type: String,
        validate: {
          validator: function (v: any) {
            return /^https?:\/\/.+/.test(v);
          },
          message: 'Invalid media URL format',
        },
      },
    ],
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    collections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
        validate: {
          validator: async function (v: any) {
            const collection = await mongoose.model('Collection').findById(v);
            return collection !== null;
          },
          message: 'Collection does not exist',
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    sizes: [
      {
        type: String,
        trim: true,
        uppercase: true,
      },
    ],
    colors: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    price: {
      cny: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'],
      },
      bdt: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'],
      },
      currencyRate: {
        type: Number,
        required: true,
        default: 17.5, // Default CNY to BDT rate
      },
    },
    expense: {
      cny: {
        type: Number,
        required: true,
        min: [0, 'Expense cannot be negative'],
      },
      bdt: {
        type: Number,
        required: true,
        min: [0, 'Expense cannot be negative'],
      },
      currencyRate: {
        type: Number,
        required: true,
        default: 17.5, // Default CNY to BDT rate
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Indexes for better query performance
ProductSchema.index({ category: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ 'price.cny': 1 });
ProductSchema.index({ 'price.bdt': 1 });

// Pre-save middleware to update timestamps and calculate BDT prices
ProductSchema.pre('save', function (next) {
  const doc = this as any;
  doc.updatedAt = new Date();

  // Calculate BDT prices if CNY prices are modified
  if (doc.isModified('price.cny')) {
    doc.price.bdt = Number((doc.price.cny * doc.price.currencyRate).toFixed(2));
  }

  if (doc.isModified('expense.cny')) {
    doc.expense.bdt = Number(
      (doc.expense.cny * doc.expense.currencyRate).toFixed(2)
    );
  }

  next();
});

// Virtual for profit calculation in both currencies
ProductSchema.virtual('profit').get(function () {
  const doc = this as any;
  return {
    cny: Number((doc.price.cny - doc.expense.cny).toFixed(2)),
    bdt: Number((doc.price.bdt - doc.expense.bdt).toFixed(2)),
  };
});

// Method to update currency rates and recalculate BDT prices
ProductSchema.methods.updateCurrencyRate = async function (newRate: number) {
  this.price.currencyRate = newRate;
  this.expense.currencyRate = newRate;
  this.price.bdt = Number((this.price.cny * newRate).toFixed(2));
  this.expense.bdt = Number((this.expense.cny * newRate).toFixed(2));
  return this.save();
};

// Ensure model is only compiled once
const Product =
  mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;
