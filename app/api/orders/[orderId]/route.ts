import Order from '@/lib/models/Order';
import Customer from '@/lib/models/Customer';
import { connectToDB } from '@/lib/mongoDB';
import { NextRequest, NextResponse } from 'next/server';

// Get order by orderId
export const GET = async (
  req: NextRequest,
  { params }: { params: { orderId: string } }
) => {
  try {
    await connectToDB();
    const orderDetails = await Order.findById(params.orderId).populate({
      path: 'products.product',
      model: 'Product',
    });

    if (!orderDetails) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const customer = await Customer.findOne({
      clerkId: orderDetails.customerClerkId,
    });

    return NextResponse.json({ orderDetails, customer }, { status: 200 });
  } catch (error) {
    console.error('[orderId_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};
