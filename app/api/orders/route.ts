import Order from '@/lib/models/Order';
import Customer from '@/lib/models/Customer';
import { connectToDB } from '@/lib/mongoDB';
import { NextRequest, NextResponse } from 'next/server';

// Fetch all orders
export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const orders = await Order.find()
      .populate({
        path: 'products.product',
        model: 'Product',
      })
      .populate({
        path: 'userId',
        model: 'Customer',
        select: 'name email phone',
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('[orders_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};

// Create a new order
export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();
    const {
      userId,
      customerInfo,
      products,
      shippingAddress,
      shippingMethod,
      deliveryType,
      paymentMethod,
      subtotal,
      shippingRate,
      totalDiscount = 0,
      totalAmount,
    } = await req.json();

    // Validate required fields
    if (!userId || !products?.length || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if customer exists
    const customer = await Customer.findOne({ userId });
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Create order with initial tracking history
    const newOrder = await Order.create({
      userId,
      customerInfo,
      products,
      shippingAddress,
      shippingMethod,
      deliveryType,
      paymentMethod,
      subtotal,
      shippingRate,
      totalDiscount,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      trackingHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          location: 'Order Received',
          notes: 'Order placed successfully',
        },
      ],
    });

    // Update customer's order stats
    await Customer.findOneAndUpdate(
      { userId },
      {
        $push: { orders: newOrder._id },
        $inc: { totalOrders: 1, totalSpent: totalAmount },
      }
    );

    return NextResponse.json(
      { success: true, order: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error('[orders_POST]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};
