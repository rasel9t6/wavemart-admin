import Order from '@/lib/models/Order';
import Customer from '@/lib/models/Customer';
import { connectToDB } from '@/lib/mongoDB';
import { NextRequest, NextResponse } from 'next/server';

// 🔹 Fetch all orders (Admin View)
export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const orders = await Order.find()
      .populate('products.product') // ✅ Ensure product data is populated
      .populate({
        path: 'customerClerkId',
        model: 'Customer',
        select: 'name email phone',
        // ✅ Fetch only necessary fields
      })
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return NextResponse.json([], { status: 200 }); // ✅ Return empty array, not undefined
    }

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('[orders_GET] API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};
// 🔹 Create a new order (called from Store Project)
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

    // ✅ Validate required fields
    if (!customerClerkId || !products?.length || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ✅ Ensure customer exists
    const customer = await Customer.findOne({ clerkId: customerClerkId });
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // ✅ Create order with initial tracking history
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
