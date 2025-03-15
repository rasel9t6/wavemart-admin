import Order from '@/lib/models/Order';
import { connectToDB } from '@/lib/mongoDB';
import { NextRequest, NextResponse } from 'next/server';

// Get a single order by ID
export const GET = async (
  req: NextRequest,
  { params }: { params: { orderId: string } }
) => {
  try {
    await connectToDB();
    const { orderId } = params;

    const order = await Order.findOne({ orderId })
      .populate('products.product')
      .populate({
        path: 'userId',
        model: 'Customer',
        select: 'name email phone address',
      });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('[order_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};

// Update order (Admin Only)
export const PATCH = async (
  req: NextRequest,
  { params }: { params: { orderId: string } }
) => {
  try {
    await connectToDB();
    const { orderId } = params;
    const { status, paymentStatus, trackingHistory, shippingAddress } =
      await req.json();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order fields
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (shippingAddress) order.shippingAddress = shippingAddress;

    // Add tracking history if provided
    if (trackingHistory) {
      order.trackingHistory.push({
        status,
        timestamp: new Date(),
        location: trackingHistory.location || 'Updated by Admin',
        notes: trackingHistory.notes || '',
      });
    }

    await order.save();

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error) {
    console.error('[order_PATCH]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};


export const DELETE = async (
  req: NextRequest,
  { params }: { params: { orderId: string } }
) => {
  try {
    await connectToDB();
    const { orderId } = params;

    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: 'Order deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[order_DELETE]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};
