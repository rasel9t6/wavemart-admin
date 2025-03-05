import Customer from '@/lib/models/Customer';
import Order from '@/lib/models/Order';
import { connectToDB } from '@/lib/mongoDB';
import { NextRequest, NextResponse } from 'next/server';

// Fetch all customers
export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();
    const customers = await Customer.find().sort({ createdAt: -1 });

    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    console.error('[customers_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};

// Create a new customer (called from Store Project)
export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();
    const {
      customerClerkId,
      products,
      shippingMethod,
      deliveryType,
      shippingAddress,
      totalAmount,
      totalDiscount,
    } = await req.json();

    // ✅ Ensure required fields
    if (!customerClerkId || !products?.length || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ✅ Check if customer exists, if not create one
    let customer = await Customer.findOne({ clerkId: customerClerkId });
    if (!customer) {
      customer = await Customer.create({
        clerkId: customerClerkId,
        name: 'Unknown',
        email: 'unknown@example.com',
        phone: '0000000000',
        address: shippingAddress,
      });
    }

    // ✅ Create order with tracking history
    const newOrder = await Order.create({
      customerClerkId,
      products,
      shippingMethod,
      deliveryType,
      shippingAddress,
      totalAmount,
      totalDiscount,
      status: 'pending',
      trackingHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          location: 'Order Received',
        },
      ],
    });

    // ✅ Link order to customer
    await Customer.findOneAndUpdate(
      { clerkId: customerClerkId },
      { $push: { orders: newOrder._id } }
    );

    return NextResponse.json(
      { success: true, order: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error('[orders_POST] API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};

