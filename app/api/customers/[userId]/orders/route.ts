import { connectToDB } from '@/lib/mongoDB';
import { NextRequest, NextResponse } from 'next/server';
import cors from '@/lib/cros';
import Order from '@/models/Order';
import Customer from '@/models/Customer';

export const GET = async (
  req: NextRequest,
  { params }: { params: { userId: string } }
) => {
  try {
    await connectToDB();
    const { userId } = params;

    // Find all orders for this customer
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    // Create response
    const response = NextResponse.json(orders, { status: 200 });

    // Apply CORS headers
    const corsHeaders = cors(req);
    corsHeaders.forEach((value, key) => response.headers.set(key, value));

    return response;
  } catch (error) {
    console.error('[customer_orders_GET]', error);

    const response = NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );

    // Apply CORS headers to error response
    const corsHeaders = cors(req);
    corsHeaders.forEach((value, key) => response.headers.set(key, value));

    return response;
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { userId: string } }
) => {
  try {
    await connectToDB();
    const { userId } = params;
    const updateData = await req.json(); // Get updated data from request

    // Update Customer details
    if (updateData.name || updateData.phone || updateData.address) {
      await Customer.updateOne(
        { userId }, // Ensure you have a unique user identifier
        {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.phone && { phone: updateData.phone }),
          ...(updateData.address && { address: updateData.address }),
          ...(updateData.orders && { orders: updateData.orders }),
        },
        { new: true } // Return the updated document
      );
    }

    // Optionally, you can also update orders if needed
    // For example, if you want to consolidate updates,
    // add logic here to handle orders if updateData contains orders info

    // Create a response confirming the update
    const response = NextResponse.json(
      { message: 'Customer information updated successfully' },
      { status: 200 }
    );

    // Apply CORS headers
    const corsHeaders = cors(req);
    corsHeaders.forEach((value, key) => response.headers.set(key, value));

    return response;
  } catch (error) {
    console.error('[customer_update_PATCH]', error);

    const response = NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );

    // Apply CORS headers to error response
    const corsHeaders = cors(req);
    corsHeaders.forEach((value, key) => response.headers.set(key, value));

    return response;
  }
};
