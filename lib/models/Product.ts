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
      ranges: [
        {
          minQuantity: { type: Number, required: true },
          maxQuantity: { type: Number },
          price: {
            cny: { type: Number, min: [0, 'Price cannot be negative'] },
            usd: { type: Number, min: [0, 'Price cannot be negative'] },
            bdt: { type: Number, min: [0, 'Price cannot be negative'] },
          },
        },
      ],
      default: [
        { minQuantity: 1, maxQuantity: 10, price: { cny: 10, usd: 0, bdt: 0 } },
        { minQuantity: 11, maxQuantity: 99, price: { cny: 8, usd: 0, bdt: 0 } },
        { minQuantity: 100, price: { cny: 7, usd: 0, bdt: 0 } },
      ],
    },
    price: {
      cny: {
        type: Number,
        min: [0, 'Price cannot be negative'],
      },
      usd: {
        type: Number,
        min: [0, 'Price cannot be negative'],
      },
      bdt: {
        type: Number,
        min: [0, 'Price cannot be negative'],
      },
    },
    expense: {
      cny: {
        type: Number,
        min: [0, 'Expense cannot be negative'],
      },
      usd: {
        type: Number,
        min: [0, 'Expense cannot be negative'],
      },
      bdt: {
        type: Number,
        min: [0, 'Expense cannot be negative'],
      },
    },
    currencyRates: {
      usdToBdt: {
        type: Number,
        required: true,
        default: 121.5, // Default USD to BDT rate
      },
      cnyToBdt: {
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
ProductSchema.index({ 'price.usd': 1 });
ProductSchema.index({ 'price.bdt': 1 });

// Pre-validate middleware to ensure either CNY or USD price is provided
ProductSchema.pre('validate', function (next) {
  const doc = this as any;
  if (!doc.price[doc.inputCurrency.toLowerCase()]) {
    next(new Error(`Price in ${doc.inputCurrency} is required`));
  }
  next();
});

// Pre-save middleware to update timestamps and calculate prices
ProductSchema.pre('save', function (next) {
  const doc = this as any;
  doc.updatedAt = new Date();

  // Convert prices based on input currency
  if (doc.inputCurrency === 'USD') {
    // If USD is input, calculate CNY and BDT
    if (doc.isModified('price.usd')) {
      doc.price.bdt = Number(
        (doc.price.usd * doc.currencyRates.usdToBdt).toFixed(2)
      );
      // Calculate CNY through BDT
      doc.price.cny = Number(
        (doc.price.bdt / doc.currencyRates.cnyToBdt).toFixed(2)
      );
    }
    if (doc.isModified('expense.usd')) {
      doc.expense.bdt = Number(
        (doc.expense.usd * doc.currencyRates.usdToBdt).toFixed(2)
      );
      doc.expense.cny = Number(
        (doc.expense.bdt / doc.currencyRates.cnyToBdt).toFixed(2)
      );
    }
  } else {
    // If CNY is input, calculate USD and BDT
    if (doc.isModified('price.cny')) {
      doc.price.bdt = Number(
        (doc.price.cny * doc.currencyRates.cnyToBdt).toFixed(2)
      );
      doc.price.usd = Number(
        (doc.price.bdt / doc.currencyRates.usdToBdt).toFixed(2)
      );
    }
    if (doc.isModified('expense.cny')) {
      doc.expense.bdt = Number(
        (doc.expense.cny * doc.currencyRates.cnyToBdt).toFixed(2)
      );
      doc.expense.usd = Number(
        (doc.expense.bdt / doc.currencyRates.usdToBdt).toFixed(2)
      );
    }
  }

  // Update quantity pricing based on input currency
  if (doc.isModified('quantityPricing.ranges')) {
    doc.quantityPricing.ranges.forEach((range: any) => {
      if (doc.inputCurrency === 'USD') {
        if (range.price.usd) {
          range.price.bdt = Number(
            (range.price.usd * doc.currencyRates.usdToBdt).toFixed(2)
          );
          range.price.cny = Number(
            (range.price.bdt / doc.currencyRates.cnyToBdt).toFixed(2)
          );
        }
      } else {
        if (range.price.cny) {
          range.price.bdt = Number(
            (range.price.cny * doc.currencyRates.cnyToBdt).toFixed(2)
          );
          range.price.usd = Number(
            (range.price.bdt / doc.currencyRates.usdToBdt).toFixed(2)
          );
        }
      }
    });
  }

  next();
});

// Virtual for profit calculation in all currencies
ProductSchema.virtual('profit').get(function () {
  const doc = this as any;
  return {
    cny: Number((doc.price.cny - doc.expense.cny).toFixed(2)),
    usd: Number((doc.price.usd - doc.expense.usd).toFixed(2)),
    bdt: Number((doc.price.bdt - doc.expense.bdt).toFixed(2)),
  };
});

// Method to update currency rates and recalculate all prices
ProductSchema.methods.updateCurrencyRates = async function (
  newUsdToBdtRate: number,
  newCnyToBdtRate: number
) {
  this.currencyRates.usdToBdt = newUsdToBdtRate;
  this.currencyRates.cnyToBdt = newCnyToBdtRate;

  // Recalculate all prices based on input currency
  if (this.inputCurrency === 'USD') {
    this.price.bdt = Number((this.price.usd * newUsdToBdtRate).toFixed(2));
    this.price.cny = Number((this.price.bdt / newCnyToBdtRate).toFixed(2));
    this.expense.bdt = Number((this.expense.usd * newUsdToBdtRate).toFixed(2));
    this.expense.cny = Number((this.expense.bdt / newCnyToBdtRate).toFixed(2));
  } else {
    this.price.bdt = Number((this.price.cny * newCnyToBdtRate).toFixed(2));
    this.price.usd = Number((this.price.bdt / newUsdToBdtRate).toFixed(2));
    this.expense.bdt = Number((this.expense.cny * newCnyToBdtRate).toFixed(2));
    this.expense.usd = Number((this.expense.bdt / newUsdToBdtRate).toFixed(2));
  }

  // Update quantity pricing
  this.quantityPricing.ranges.forEach((range: any) => {
    if (this.inputCurrency === 'USD') {
      range.price.bdt = Number((range.price.usd * newUsdToBdtRate).toFixed(2));
      range.price.cny = Number((range.price.bdt / newCnyToBdtRate).toFixed(2));
    } else {
      range.price.bdt = Number((range.price.cny * newCnyToBdtRate).toFixed(2));
      range.price.usd = Number((range.price.bdt / newUsdToBdtRate).toFixed(2));
    }
  });

  return this.save();
};
// Method to get price for a specific quantity
ProductSchema.methods.getPriceForQuantity = function (quantity: number) {
  const range = this.quantityPricing.ranges.find(
    (r: any) =>
      quantity >= r.minQuantity && (!r.maxQuantity || quantity <= r.maxQuantity)
  );

  if (!range) {
    throw new Error('No price range found for the specified quantity');
  }

  return range.price;
};

// Ensure model is only compiled once
const Product =
  mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;
