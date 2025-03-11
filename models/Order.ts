import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerClerkId: String,
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      color: String,
      size: String,
      quantity: Number,
      price: Number,
    },
  ],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  shippingMethod: String, // "air" or "sea"
  deliveryType: String, // "door-to-door" or "warehouse"
  shippingRate: Number,
  totalDiscount: Number,
  totalAmount: Number,

  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'shipped',
      'in-transit',
      'out-for-delivery',
      'delivered',
      'canceled',
    ],
    default: 'pending',
  },

  trackingHistory: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
      location: String, // Optional, if available
    },
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
