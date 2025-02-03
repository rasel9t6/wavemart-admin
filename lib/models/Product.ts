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
            // URL validation
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
      type: Number,
      required: true,
      min: 0,
    },
    expense: {
      type: Number,
      required: true,
      min: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true, // Cannot be modified after creation
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

// Pre-save middleware to update timestamps
ProductSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Ensure model is only compiled once
const Product =
  mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;
