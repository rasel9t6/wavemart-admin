import { NextRequest, NextResponse } from 'next/server';
import cors from '@/lib/cros';
import { connectToDB } from '@/lib/mongoDB';
import Customer from '@/models/Customer';
import Order from '@/models/Order';
import { verifyApiKey } from '@/lib/auth';

// Handle CORS for OPTIONS requests (Preflight requests)
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: cors(req) });
}

// Fetch all orders
export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const orders = await Order.find()
      .populate({
        path: 'products.product',
        model: 'Product',
      })
      .populate({
        path: 'customerId',
        model: 'Customer',
        select: 'name email phone address',
      })
      .sort({ createdAt: -1 });

    return new NextResponse(JSON.stringify(orders), {
      status: 200,
      headers: cors(req),
    });
  } catch (error) {
    console.error('[orders_GET]', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: cors(req) }
    );
  }
};

// Create a new order
export const POST = async (req: NextRequest) => {
  try {
    const headers = cors(req);

    const authHeader = req.headers.get('authorization');
    if (!verifyApiKey(authHeader)) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers,
      });
    }

    const orderData = await req.json();

    // Validate required fields
    if (
      !orderData.userId ||
      !orderData.products ||
      !orderData.shippingAddress
    ) {
      return new NextResponse(
        JSON.stringify({
          error: 'Missing required fields: userId, products, shippingAddress',
        }),
        { status: 400, headers }
      );
    }

    await connectToDB();

    // Create new order
    const newOrder = await Order.create({
      ...orderData,
      trackingHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          location: 'Order received',
        },
      ],
    });

    // Find the customer to update their orders array
    const customer = await Customer.findOne({ customerId: orderData.userId });

    if (customer) {
      // Add order to customer's orders array
      customer.orders.push(newOrder._id);
      await customer.save();
    } else {
      console.error(`Customer with ID ${orderData.userId} not found`);
    }

    return new NextResponse(
      JSON.stringify({
        message: 'Order created successfully',
        order: newOrder,
      }),
      { status: 201, headers }
    );
  } catch (error) {
    console.error('[ORDER_CREATE_ERROR]', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: cors(req) }
    );
  }
};
