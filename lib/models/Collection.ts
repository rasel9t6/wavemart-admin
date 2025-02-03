import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  icon: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Products',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Collection =
  mongoose.models.Collection || mongoose.model('Collection', collectionSchema);

export default Collection;
