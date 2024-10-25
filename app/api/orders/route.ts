import Order from '@/lib/models/Order';
import { connectToDB } from '@/lib/mongoDB';
import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    // Fetch orders and sort by creation date
    const orders = await Order.find().sort({ createdAt: 'desc' });

    const orderDetails = await Promise.all(
      orders.map(async (order) => {
        // Assuming you are fetching customer info from the same model,
        // but if customer data is in another model, fetch it from that model instead.
        const customer = await Order.findOne({ clerkId: order.clerkId });

        return {
          _id: order._id,
          customer: customer?.name || 'Unknown Customer',
          products: order.products.length, // Naming clarity
          totalAmount: order.totalAmount,
          createdAt: format(new Date(order.createdAt), 'MMM do, yyyy'),
        };
      })
    );

    return NextResponse.json(orderDetails, { status: 200 });
  } catch (error) {
    console.log('[orders_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
export const dynamic = 'force-dynamic';