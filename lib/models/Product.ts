import mongoose from 'mongoose';
import slugify from 'slugify';
import Category from './Category';
import Subcategory from './Subcategory';

// Create custom type for price and expense
const CurrencySchema = new mongoose.Schema(
  {
    cny: {
      type: Number,
      min: [0, 'Value cannot be negative'],
      default: 0,
      validate: {
        validator: function (this: any, v: any) {
          // If no value is provided for both, that's fine
          return v !== undefined || !this.parent().usd;
        },
        message: 'At least one currency (CNY or USD) must be provided',
      },
    },
    usd: {
      type: Number,
      min: [0, 'Value cannot be negative'],
      default: 0,
      validate: {
        validator: function (this: any, v: any) {
          // If no value is provided for both, that's fine
          return v !== undefined || !this.parent().cny;
        },
        message: 'At least one currency (CNY or USD) must be provided',
      },
    },
    bdt: {
      type: Number,
      min: [0, 'Value cannot be negative'],
      default: 0,
    },
  },
  { _id: false }
);

// Create range schema for quantity pricing
const RangeSchema = new mongoose.Schema(
  {
    minQuantity: { type: Number, required: true, min: 1 },
    maxQuantity: {
      type: Number,
      min: [1, 'Max quantity must be at least 1'],
      validate: {
        validator: function (this: any, v: any) {
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

const ProductSchema = new mongoose.Schema(
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
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        index: true,
      },
    ],
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
        validate: [
          {
            validator: function (ranges: any) {
              // Ensure no overlapping quantity ranges
              if (!ranges || ranges.length <= 1) return true;

              for (let i = 0; i < ranges.length; i++) {
                for (let j = i + 1; j < ranges.length; j++) {
                  const range1 = ranges[i];
                  const range2 = ranges[j];

                  // Check for overlapping ranges
                  const overlap =
                    (range1.minQuantity <= range2.maxQuantity &&
                      range1.maxQuantity >= range2.minQuantity) ||
                    (range2.minQuantity <= range1.maxQuantity &&
                      range2.maxQuantity >= range1.minQuantity);

                  if (overlap) {
                    return false;
                  }
                }
              }
              return true;
            },
            message: 'Quantity ranges cannot overlap',
          },
        ],
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
// Populate category and subcategories automatically
ProductSchema.virtual('categoryDetails', {
  ref: 'Category',
  localField: 'category',
  foreignField: '_id',
  justOne: true,
});

ProductSchema.virtual('subcategoryDetails', {
  ref: 'Subcategory',
  localField: 'subcategories',
  foreignField: '_id',
});
ProductSchema.post('save', async function (doc) {
  try {
    // ✅ Update the parent Category to include this product
    if (doc.category) {
      await Category.findByIdAndUpdate(doc.category, {
        $addToSet: { products: doc._id },
      });
      console.log(`✅ Category Updated: ${doc.category}`);
    }

    // ✅ Update all associated Subcategories to include this product
    if (doc.subcategories && doc.subcategories.length > 0) {
      await Subcategory.updateMany(
        { _id: { $in: doc.subcategories } },
        { $addToSet: { products: doc._id } }
      );
      console.log(`✅ Subcategories Updated: ${doc.subcategories}`);
    }
  } catch (error) {
    console.error('❌ Error updating Category/Subcategory:', error);
  }
});

// Generate slug before saving
ProductSchema.pre('save', function (next) {
  try {
    // Slug generation
    if (this.isModified('title')) {
      this.slug = slugify(this.title, { lower: true, strict: true });
    }

    // Comprehensive currency conversion logic
    const convertCurrency = (inputValue: number, rate: number) =>
      inputValue && rate ? Number((inputValue * rate).toFixed(2)) : 0;

    // Currency conversion helper function
    const performCurrencyConversion = (
      inputCurrency: 'USD' | 'CNY',
      currencyObj: any,
      currencyRates: any
    ) => {
      if (!currencyObj || !currencyRates) return currencyObj;

      const conversionRates = {
        USD: {
          toBDT: currencyRates.usdToBdt,
          toCNY: 7,
        },
        CNY: {
          toBDT: currencyRates.cnyToBdt,
          toUSD: 1 / 7,
        },
      };

      const rates = conversionRates[inputCurrency];

      // Conversion based on input currency
      if (inputCurrency === 'USD' && currencyObj.usd) {
        currencyObj.bdt = convertCurrency(currencyObj.usd, rates.toBDT);

        // Calculate CNY only if not provided
        if (!currencyObj.cny && inputCurrency === 'USD') {
          currencyObj.cny = convertCurrency(
            currencyObj.usd,
            (rates as { toCNY: number }).toCNY
          );
        }
      } else if (inputCurrency === 'CNY' && currencyObj.cny) {
        currencyObj.bdt = convertCurrency(currencyObj.cny, rates.toBDT);

        // Calculate USD only if not provided
        if (!currencyObj.usd && 'toUSD' in rates) {
          currencyObj.usd = convertCurrency(currencyObj.cny, rates.toUSD);
        }
      }

      return currencyObj;
    };

    // Perform conversions
    if (this.price && this.currencyRates) {
      this.price = performCurrencyConversion(
        this.inputCurrency,
        this.price,
        this.currencyRates
      );
    }

    if (this.expense && this.currencyRates) {
      this.expense = performCurrencyConversion(
        this.inputCurrency,
        this.expense,
        this.currencyRates
      );
    }

    // Quantity pricing conversion
    if (this.quantityPricing?.ranges?.length) {
      this.quantityPricing.ranges.forEach((range) => {
        if (range.price && this.currencyRates) {
          range.set(
            'price',
            performCurrencyConversion(
              this.inputCurrency,
              range.price,
              this.currencyRates
            )
          );
        }
      });
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Indexes
ProductSchema.index({ title: 'text', description: 'text' });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ 'price.cny': 1, 'price.usd': 1, 'price.bdt': 1 });

const Product =
  mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;
