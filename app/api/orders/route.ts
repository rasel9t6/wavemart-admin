import Order from '@/lib/models/Order';
import Customer from '@/lib/models/Customer';
import { connectToDB } from '@/lib/mongoDB';
import { NextRequest, NextResponse } from 'next/server';
import cors from '@/lib/cros';

export async function OPTIONS(req: NextRequest) {
  // Return 204 No Content for preflight
  const res = new NextResponse(null, { status: 204 });
  return cors(req, res);
}
// Fetch all orders
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

    // Validate required fields
    if (!userId || !products?.length || !totalAmount) {
      const res = NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
      return cors(req, res);
    }

    // ✅ Ensure customer exists
    const customer = await Customer.findOne({ clerkId: customerClerkId });
    if (!customer) {
      const res = NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
      return cors(req, res);
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

    const res = NextResponse.json(
      { success: true, order: newOrder },
      { status: 201 }
    );
    return cors(req, res);
  } catch (error) {
    console.error('[orders_POST]', error);
    const res = NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
    return cors(req, res);
  }
};
