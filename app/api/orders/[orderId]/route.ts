import { connectToDB } from '@/lib/mongoDB';
import Order from '@/models/Order';
import { NextRequest, NextResponse } from 'next/server';
import cors from '@/lib/cros';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const headers = cors(req); // Ensure CORS is included in all responses
    await connectToDB();

    const { orderId } = params;
    const { status, location } = await req.json();

    if (!status) {
      return new NextResponse(JSON.stringify({ error: 'Status is required' }), {
        status: 400,
        headers,
      });
    }

    // Find order by either _id or custom orderId field
    const order = await Order.findOne({ orderId }); // Change to { orderId } if it's a custom field

    if (!order) {
      return new NextResponse(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers,
      });
    }

    // Update status & tracking history
    order.status = status;
    order.trackingHistory.push({
      status,
      timestamp: new Date(),
      location: location || 'Status updated',
    });

    await order.save();

    return new NextResponse(
      JSON.stringify({ message: 'Order status updated successfully', order }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('[ORDER_STATUS_UPDATE_ERROR]', error);
    const headers = cors(req);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers }
    );
  }
}
