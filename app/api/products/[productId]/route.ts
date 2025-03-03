import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import Subcategory from '@/lib/models/Subcategory';
import { connectToDB } from '@/lib/mongoDB';
import { auth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

interface ProductDocument {
  _id: string;
  category: { name: string };
  subcategories: { name: string }[];
  quantityPricing: any[];
  price: Record<string, any>;
  expense: Record<string, any>;
  currencyRates: Record<string, any>;
  media?: any[];
  tags?: string[];
  sizes?: string[];
  colors?: string[];
}

export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await connectToDB();

    // Find product and populate category and subcategories
    const product = (await Product.findById(params.productId)
      .populate('category', 'name')
      .populate('subcategories', 'name')
      .lean()) as ProductDocument;

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Ensure the response is properly structured
    const response = {
      ...product,
      category: product.category?.name || 'Unknown', // Ensure category is a string
      subcategories: product.subcategories
        ? product.subcategories.map((sub) => sub.name).join(', ')
        : 'None', // Convert array of subcategories to a string
      quantityPricing: product.quantityPricing || [],
      price: product.price || {},
      expense: product.expense || {},
      currencyRates: product.currencyRates || {},
      media: product.media || [],
      tags: product.tags || [],
      sizes: product.sizes || [],
      colors: product.colors || [],
    };

    revalidatePath(`/products/${params.productId}`);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

const handleError = (message: string, status: number = 500): NextResponse => {
  console.error(message);
  return new NextResponse(message, { status });
};

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return handleError('Unauthorized', 401);
    }

    await connectToDB();
    const body = await req.json();

    // Ensure subcategories are valid ObjectIds
    const subcategoryIds = (body.subcategories || []).map(
      (id: any) => new mongoose.Types.ObjectId(id)
    );

    // Create and save the new product
    const product = new Product(body);

    await product.validate();
    await product.save();

    console.log(`✅ Product Created: ${product._id}`);

    // Update the category's products array
    if (body.category) {
      await Category.findByIdAndUpdate(body.category, {
        $addToSet: { products: product._id },
      });
      console.log(`✅ Category Updated with Product: ${body.category}`);
    }

    // Update the subcategories' products array
    if (subcategoryIds.length > 0) {
      const updatedSubcategories = await Subcategory.updateMany(
        { _id: { $in: subcategoryIds } },
        { $addToSet: { products: product._id } }
      );

      console.log(
        `✅ Subcategory Update Count: ${updatedSubcategories.modifiedCount}`
      );
    } else {
      console.log('⚠️ No subcategories provided in request.');
    }

    return new NextResponse(JSON.stringify({ success: true, product }), {
      status: 201,
    });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    return handleError('Internal Server Error', 500);
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

    // Ensure category is an array for iteration
    const categoryArray = Array.isArray(product.category)
      ? product.category
      : [product.category];

    // Update category's products array
    await Promise.all(
      categoryArray.map((categoryId: string) =>
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
