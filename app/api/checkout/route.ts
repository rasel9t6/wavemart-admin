import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { cartItems, customer } = await req.json();

    if (!cartItems || !customer) {
      return new NextResponse('Not enough data to checkout', {
        status: 400,
        headers: corsHeaders,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'BD'],
      },
      shipping_options: [
        { shipping_rate: 'shr_1PThpYAToq8CUfWAY600ZlRc' },
        { shipping_rate: 'shr_1PThmOAToq8CUfWAFVjypwNu' },
      ],
      line_items: cartItems.map((cartItem: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: cartItem.item.title,
            metadata: {
              productId: cartItem.item._id,
              ...(cartItem.size && { size: cartItem.size }),
              ...(cartItem.color && { color: cartItem.color }),
            },
          },
          unit_amount: cartItem.item.price * 100,
        },
        quantity: cartItem.quantity,
      })),
      client_reference_id: customer.clerkId,
      success_url: `${process.env.STORE_URL}/payment_success`,
      cancel_url: `${process.env.STORE_URL}/cart`,
    });

    return NextResponse.json(session, { status: 200, headers: corsHeaders });
  } catch (err) {
    console.log('[checkout_POST]', err);
    return new NextResponse('Internal Server Error', {
      status: 500,
      headers: corsHeaders,
    });
  }
}
export const dynamic = 'force-dynamic';
