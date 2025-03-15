import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';
import Category from './Category';

type CurrencyRates = {
  toBDT: number;
  toCNY?: number;
  toUSD?: number;
};

type ConversionRates = {
  [key: string]: CurrencyRates;
};

// Create custom type for price and expense
interface ICurrency {
  cny: number;
  usd: number;
  bdt: number;
}
interface IRange {
  minQuantity: number;
  maxQuantity?: number;
  price: ICurrency;
}
// Define the Product interface
interface IProduct extends Document {
  sku: string;
  title: string;
  slug: string;
  description?: string;
  media: string[];
  category: mongoose.Types.ObjectId;
  tags: string[];
  sizes: string[];
  colors: string[];
  minimumOrderQuantity: number;
  inputCurrency: 'CNY' | 'USD';
  quantityPricing: { ranges: IRange[] };
  price: ICurrency;
  expense: ICurrency;
  currencyRates: {
    usdToBdt: number;
    cnyToBdt: number;
  };
  hasOverlappingRanges(ranges: IRange[]): boolean;
  performCurrencyConversions(): void;
}

// Define range interface

// Create Currency schema
const CurrencySchema = new Schema<ICurrency>(
  {
    cny: {
      type: Number,
      min: [0, 'Value cannot be negative'],
      default: 0,
    },
    usd: {
      type: Number,
      min: [0, 'Value cannot be negative'],
      default: 0,
    },
    bdt: {
      type: Number,
      min: [0, 'Value cannot be negative'],
      default: 0,
    },
  },
  { _id: false }
);

// Create Range schema
const RangeSchema = new Schema<IRange>(
  {
    minQuantity: { type: Number, required: true, min: 1 },
    maxQuantity: {
      type: Number,
      min: [1, 'Max quantity must be at least 1'],
      validate: {
        validator: function (this: IRange & Document, v: number) {
          return !v || v >= this.minQuantity;
        },
        message:
          'Max quantity must be greater than or equal to minimum quantity',
      },
    },
    price: CurrencySchema,
  },
  { _id: false }
);

// Main Product Schema
const ProductSchema = new Schema<IProduct>(
  {
    sku: { type: String, required: true },
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
    tags: [String],
    sizes: [String],
    colors: [String],
    minimumOrderQuantity: {
      type: Number,
      required: true,
      min: [1, 'Minimum order quantity must be at least 1'],
      default: 1,
    },
    inputCurrency: {
      type: String,
      enum: ['CNY', 'USD'],
      required: [true, 'Input currency is required'],
      default: 'CNY',
    },
    quantityPricing: {
      ranges: {
        type: [RangeSchema],
        validate: {
          validator: function (this: IProduct, ranges: IRange[]) {
            // Use 'this' to refer to the product instance
            return (
              !ranges || ranges.length <= 1 || this.hasOverlappingRanges(ranges)
            );
          },
          message: 'Quantity ranges cannot overlap',
        },
      },
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

// Instance method to check for overlapping ranges
ProductSchema.methods.hasOverlappingRanges = function (
  ranges: IRange[]
): boolean {
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      const range1 = ranges[i];
      const range2 = ranges[j];
      const overlap =
        (range1.minQuantity <= range2.maxQuantity! &&
          range1.maxQuantity! >= range2.minQuantity) ||
        (range2.minQuantity <= range1.maxQuantity! &&
          range2.maxQuantity! >= range1.minQuantity);
      if (overlap) return true;
    }
  }
  return false;
};

// Populate category details automatically
ProductSchema.virtual('categoryDetails', {
  ref: 'Category',
  localField: 'category',
  foreignField: '_id',
  justOne: true,
});

// Update parent Category on product save
ProductSchema.post('save', async function (doc: IProduct) {
  try {
    if (doc.category) {
      await Category.findByIdAndUpdate(doc.category, {
        $addToSet: { products: doc._id },
      });
      console.log(`✅ Category Updated: ${doc.category}`);
    }
  } catch (error) {
    console.error('❌ Error updating Category:', error);
  }
});

// Generate slug before saving
ProductSchema.pre<IProduct>('save', function (next) {
  try {
    if (this.isModified('title') && !this.isNew) {
      this.slug = slugify(this.title, { lower: true, strict: true });
    }
    this.performCurrencyConversions();
    next();
  } catch (error: any) {
    next(error);
  }
});

// Currency conversion logic
ProductSchema.methods.performCurrencyConversions = function () {
  const convertCurrency = (inputValue: number, rate: number) =>
    inputValue && rate ? Number((inputValue * rate).toFixed(2)) : 0;

  const performConversion = (
    inputCurrency: 'CNY' | 'USD',
    currencyObj: ICurrency
  ) => {
    if (!currencyObj || !this.currencyRates) return currencyObj;

    const rates: ConversionRates = {
      USD: { toBDT: this.currencyRates.usdToBdt, toCNY: 7 },
      CNY: { toBDT: this.currencyRates.cnyToBdt, toUSD: 1 / 7 },
    };

    const currentRates = rates[inputCurrency];

    if (inputCurrency === 'USD' && currencyObj.usd) {
      currencyObj.bdt = convertCurrency(currencyObj.usd, currentRates.toBDT);
      if (!currencyObj.cny) {
        currencyObj.cny = convertCurrency(currencyObj.usd, currentRates.toCNY!);
      }
    } else if (inputCurrency === 'CNY' && currencyObj.cny) {
      currencyObj.bdt = convertCurrency(currencyObj.cny, currentRates.toBDT);
      if (!currencyObj.usd) {
        currencyObj.usd = convertCurrency(currencyObj.cny, currentRates.toUSD!);
      }
    }

    return currencyObj;
  };

  if (this.price)
    this.price = performConversion(this.inputCurrency, this.price);
  if (this.expense)
    this.expense = performConversion(this.inputCurrency, this.expense);

  // Quantity pricing conversion
  if (this.quantityPricing?.ranges) {
    this.quantityPricing.ranges.forEach((range: IRange) => {
      if (range.price) {
        range.price = performConversion(this.inputCurrency, range.price);
      }
    });
  }
};

// Indexes
ProductSchema.index({ title: 'text', description: 'text' });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ 'price.cny': 1, 'price.usd': 1, 'price.bdt': 1 });

const Product =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
