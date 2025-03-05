import Order from '@/lib/models/Order';
import { connectToDB } from '@/lib/mongoDB';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();
    const { orderId, status, location } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status and add tracking history
    order.status = status;
    order.trackingHistory.push({ status, location, timestamp: new Date() });

    await order.save();

    return NextResponse.json(
      { success: true, message: 'Order status updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[update-order-status_POST]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};
