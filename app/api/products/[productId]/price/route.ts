// app/api/products/[id]/price/route.ts
import Product from '@/lib/models/Product';
import { connectToDB } from '@/lib/mongoDB';
import { NextRequest, NextResponse } from 'next/server';

interface Props {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const quantity = parseInt(searchParams.get('quantity') || '1');

    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (quantity < product.minimumOrderQuantity) {
      return NextResponse.json(
        { error: `Minimum order quantity is ${product.minimumOrderQuantity}` },
        { status: 400 }
      );
    }

    const price = product.getPriceForQuantity(quantity);
    return NextResponse.json({
      quantity,
      price,
      total: {
        cny: Number((price.cny * quantity).toFixed(2)),
        usd: Number((price.usd * quantity).toFixed(2)),
        bdt: Number((price.bdt * quantity).toFixed(2)),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate price' },
      { status: 400 }
    );
  }
}
