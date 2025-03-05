import Order from '@/lib/models/Order';
import { connectToDB } from '@/lib/mongoDB';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId)
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );

    const order = await Order.findById(orderId);
    if (!order)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json(
      {
        status: order.status,
        trackingHistory: order.trackingHistory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[track-order_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};
