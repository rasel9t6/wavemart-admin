import mongoose from 'mongoose';
import slugify from 'slugify';

// Create custom type for price and expense
const CurrencySchema = new mongoose.Schema(
  {
    cny: { type: Number, min: [0, 'Value cannot be negative'] },
    usd: { type: Number, min: [0, 'Value cannot be negative'] },
    bdt: { type: Number, min: [0, 'Value cannot be negative'] },
  },
  { _id: false }
);

// Create range schema for quantity pricing
const RangeSchema = new mongoose.Schema(
  {
    minQuantity: { type: Number, required: true, min: 1 },
    maxQuantity: { type: Number, min: 1 },
    price: CurrencySchema,
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxLength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
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
          validator: (v: string) => /^https?:\/\/.+/.test(v),
          message: 'Invalid media URL format',
        },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        index: true,
      },
    ],
    tags: [{ type: String, trim: true, lowercase: true }],
    sizes: [{ type: String, trim: true, uppercase: true }],
    colors: [{ type: String, trim: true, lowercase: true }],
    minimumOrderQuantity: {
      type: Number,
      required: true,
      min: [1, 'Minimum order quantity must be at least 1'],
      default: 1,
    },
    inputCurrency: {
      type: String,
      enum: ['CNY', 'USD'],
      required: true,
      default: 'CNY',
    },
    quantityPricing: {
      ranges: [RangeSchema],
    },
    price: CurrencySchema,
    expense: CurrencySchema,
    currencyRates: {
      usdToBdt: { type: Number, required: true, default: 121.5 },
      cnyToBdt: { type: Number, required: true, default: 17.5 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate slug before saving
ProductSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  // Calculate BDT prices based on input currency
  if (this.inputCurrency === 'USD') {
    if (this.price?.usd && this.currencyRates?.usdToBdt && this.price.usd) {
      this.price.bdt = this.currencyRates.usdToBdt * this.price.usd;
    }
    if (this.expense && this.currencyRates?.usdToBdt && this.expense.usd) {
      this.expense.bdt = this.currencyRates.usdToBdt * this.expense.usd;
    }
    if (this.quantityPricing?.ranges?.length) {
      this.quantityPricing.ranges.forEach((range) => {
        if (range.price?.usd && this.currencyRates?.usdToBdt) {
          range.price.bdt = this.currencyRates.usdToBdt * range.price.usd;
        }
      });
    }
  } else if (this.inputCurrency === 'CNY') {
    if (this.price?.cny && this.currencyRates && this.currencyRates.cnyToBdt) {
      this.price.bdt = this.currencyRates.cnyToBdt * this.price.cny;
    }
    if (
      this.expense?.cny !== undefined &&
      this.currencyRates?.cnyToBdt &&
      this.expense.cny
    ) {
      this.expense.bdt = this.currencyRates.cnyToBdt * this.expense.cny;
    }
    if (this.quantityPricing?.ranges?.length) {
      this.quantityPricing.ranges.forEach((range) => {
        if (
          range.price?.usd &&
          this.currencyRates?.usdToBdt &&
          range.price.cny
        ) {
          range.price.bdt = this.currencyRates.cnyToBdt * range.price.cny;
        }
      });
    }
  }

  next();
});

// Indexes
ProductSchema.index({ title: 'text', description: 'text' });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ 'price.cny': 1, 'price.usd': 1, 'price.bdt': 1 });

const Product =
  mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;
