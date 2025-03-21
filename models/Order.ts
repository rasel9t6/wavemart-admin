import mongoose from 'mongoose';

function generateSequentialNumber() {
  return Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
}
function generateOrderId() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const sequential = generateSequentialNumber();

  // Format: WM-YYMMDD-XXXX (e.g., WM-240215-0001)
  return `BSM-ORD-${day}-${month}-${year}-${sequential}`;
}
const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    default: generateOrderId,
    index: true,
  },
  userId: String,

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
  paymentMethod: String, // "cash" or "card"
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
