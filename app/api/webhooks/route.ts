import { connectToDB } from '@/lib/mongoDB';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Order from '@/lib/models/Order';
import Customer from '@/lib/models/Customer';
import { revalidatePath } from 'next/cache';

export const POST = async (req: NextRequest) => {
  try {
   
    const rawBody = await req.text();
    const signature = req.headers.get('Stripe-Signature') as string;

    // Verify the Stripe signature
    let event;
    try {
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error('Missing Stripe Webhook Secret');
      }
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Error verifying Stripe webhook signature:', err);
      return new NextResponse('Webhook Error: Signature verification failed', {
        status: 400,
      });
    }

    console.log('Webhook event constructed:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Checkout session completed:', session);

      const customerInfo = {
        clerkId: session?.client_reference_id || 'N/A',
        name: session?.customer_details?.name || 'N/A',
        email: session?.customer_details?.email || 'N/A',
      };

      const shippingAddress = {
        street: session?.shipping_details?.address?.line1 || 'N/A',
        city: session?.shipping_details?.address?.city || 'N/A',
        state: session?.shipping_details?.address?.state || 'N/A',
        postalCode: session?.shipping_details?.address?.postal_code || 'N/A',
        country: session?.shipping_details?.address?.country || 'N/A',
      };

      const retrieveSession = await stripe.checkout.sessions.retrieve(
        session.id,
        { expand: ['line_items.data.price.product'] }
      );

      console.log('Retrieved session:', retrieveSession);

      const lineItems = retrieveSession?.line_items?.data || [];

      const orderItems = lineItems.map((item: any) => ({
        product: item.price.product.metadata.productId || 'Unknown Product',
        color: item.price.product.metadata.color || 'N/A',
        size: item.price.product.metadata.size || 'N/A',
        quantity: item.quantity || 0,
      }));

      try {
        await connectToDB();
        console.log('Connected to DB');

        const newOrder = new Order({
          customerClerkId: customerInfo.clerkId,
          products: orderItems,
          shippingAddress,
          shippingRate: session?.shipping_cost?.shipping_rate || 'N/A',
          totalAmount: session.amount_total ? session.amount_total / 100 : 0,
        });

        await newOrder.save();
        console.log('Order saved:', newOrder);

        let customer = await Customer.findOne({
          clerkId: customerInfo.clerkId,
        });
        console.log('Customer found:', customer);

        if (customer) {
          customer.orders.push(newOrder._id);
        } else {
          customer = new Customer({
            ...customerInfo,
            orders: [newOrder._id],
          });
        }

        await customer.save();
        console.log('Customer saved:', customer);
      } catch (dbError) {
        console.error('Database error:', dbError);
        return new NextResponse('Database error', { status: 500 });
      }
    }
    revalidatePath('/orders');
    return new NextResponse('Order created', { status: 200 });
  } catch (err) {
    console.error('[webhooks_POST] Unexpected error:', err);
    return new NextResponse('Failed to create the order', { status: 500 });
  }
};
export const dynamic = 'force-dynamic';
