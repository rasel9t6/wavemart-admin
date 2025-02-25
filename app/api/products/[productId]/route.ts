import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import Subcategory from '@/lib/models/Subcategory';
import { connectToDB } from '@/lib/mongoDB';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await connectToDB();

    // Use lean() to get a plain JavaScript object and populate any necessary fields
    const product = (await Product.findById(params.productId).lean()) as any;

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Ensure the response is properly structured
    const response = {
      ...product,
      quantityPricing: product.quantityPricing || [],
      price: product.price || {},
      expense: product.expense || {},
      currencyRates: product.currencyRates || {},
      media: product.media || [],
      tags: product.tags || [],
      sizes: product.sizes || [],
      colors: product.colors || [],
      categories: product.category || [],
    };
    revalidatePath(`/product/${params.productId}`);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}


export const POST = async (
  req: NextRequest,
  { params }: { params: { productId: string } }
) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectToDB();

    const product = await Product.findById(params.productId);

    if (!product) {
      return new NextResponse(
        JSON.stringify({ message: 'Product not found' }),
        { status: 404 }
      );
    }

    const {
      title,
      description,
      media,
      category,
      subcategories,
      tags,
      sizes,
      colors,
      minimumOrderQuantity,
      inputCurrency,
      price,
      expense,
      quantityPricing,
      currencyRates,
    } = await req.json();

    // Validation checks
    if (!title || !description || !media || !category || !price) {
      return new NextResponse('Not enough data to update the product', {
        status: 400,
      });
    }

    // Prepare update object with all possible fields
    const updateData = {
      title,
      description,
      media,
      category,
      ...(subcategories && { subcategories }),
      tags,
      sizes,
      colors,
      ...(minimumOrderQuantity && { minimumOrderQuantity }),
      ...(inputCurrency && { inputCurrency }),
      price,
      expense,
      ...(quantityPricing && {
        quantityPricing: {
          ranges: quantityPricing.ranges || [],
        },
      }),
      ...(currencyRates && { currencyRates }),
    };

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate([
      { path: 'category', model: Category },
      { path: 'subcategories', model: Subcategory },
    ]);

    // Explicitly save to trigger pre-save middleware for currency conversions
    await updatedProduct.save();

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (err: any) {
    console.error('[productId_POST]', err);

    // Handle specific mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e: any) => e.message);
      return new NextResponse(
        JSON.stringify({
          message: 'Validation Error',
          errors,
        }),
        { status: 400 }
      );
    }

    return new NextResponse('Internal error', { status: 500 });
  }
};
export const DELETE = async (
  req: NextRequest,
  { params }: { params: { productId: string } }
) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectToDB();

    const product = await Product.findById(params.productId);

    if (!product) {
      return new NextResponse(
        JSON.stringify({ message: 'Product not found' }),
        { status: 404 }
      );
    }

    await Product.findByIdAndDelete(product._id);

    // Update collections
    await Promise.all(
      product.category.map((categoryId: string) =>
        Category.findByIdAndUpdate(categoryId, {
          $pull: { products: product._id },
        })
      )
    );
    revalidatePath('/products');
    return new NextResponse(JSON.stringify({ message: 'Product deleted' }), {
      status: 200,
    });
  } catch (err) {
    console.log('[productId_DELETE]', err);
    return new NextResponse('Internal error', { status: 500 });
  }
};

export const dynamic = 'force-dynamic';
