import Order from '@/lib/models/Order';
import { connectToDB } from '@/lib/mongoDB';
import { NextRequest, NextResponse } from 'next/server';
import cors from '@/lib/cros';

export const GET = async (
  req: NextRequest,
  { params }: { params: { userId: string } }
) => {
  try {
    await connectToDB();
    const { userId } = params;

    // Find all orders for this customer
    const orders = await Order.find({ userId })
      .populate('products.product')
      .sort({ createdAt: -1 });

    return cors(req, NextResponse.json(orders, { status: 200 }));
  } catch (error) {
    console.error('[customer_orders_GET]', error);
    return cors(
      req,
      NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    );
  }
};
