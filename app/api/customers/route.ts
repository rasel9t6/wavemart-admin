import { verifyApiKey } from '@/lib/auth';
import { connectToDB } from '@/lib/mongoDB';
import Customer from '@/models/Customer';
import { NextRequest, NextResponse } from 'next/server';

// Fetch all customers
export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();
    const customers = await Customer.find().sort({ createdAt: -1 });

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
    const authHeader = req.headers.get('authorization');
    if (!verifyApiKey(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customerData = await req.json();

    // Validate required fields
    if (
      !customerData.customerId ||
      !customerData.name ||
      !customerData.email ||
      !customerData.phone ||
      !customerData.address
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: customerId, name, email, phone, address',
        },
        { status: 400 }
      );
    }

    await connectToDB();
    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      email: customerData.email,
    });
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 409 }
      );
    }

    // Create new customer
    const newCustomer = await Customer.create(customerData);

    return NextResponse.json(
      {
        message: 'Customer created successfully',
        customer: newCustomer,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[CUSTOMER_CREATE_ERROR]', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
