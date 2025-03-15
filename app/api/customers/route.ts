import Customer from '@/lib/models/Customer';

import { connectToDB } from '@/lib/mongoDB';
import { NextRequest, NextResponse } from 'next/server';

// Fetch all customers
export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();
    const customers = await Customer.find()
      .populate('orders')
      .sort({ createdAt: -1 });

    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    console.error('[customers_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};

// Create or update a customer
export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();
    const {
      userId,
      name,
      email,
      phone,
      address,
      customerType = 'regular',
      status = 'active',
      notes,
    } = await req.json();

    // Validate required fields
    if (!userId || !name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if customer exists
    let customer = await Customer.findOne({ userId });

    if (customer) {
      // Update existing customer
      customer = await Customer.findOneAndUpdate(
        { userId },
        {
          name,
          email,
          phone,
          address,
          customerType,
          status,
          notes,
          updatedAt: new Date(),
        },
        { new: true }
      );
    } else {
      // Create new customer
      customer = await Customer.create({
        userId,
        name,
        email,
        phone,
        address,
        customerType,
        status,
        notes,
        totalOrders: 0,
        totalSpent: 0,
      });
    }

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('[customers_POST]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};
