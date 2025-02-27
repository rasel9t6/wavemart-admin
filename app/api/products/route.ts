import Collection from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import { connectToDB } from '@/lib/mongoDB';
import { auth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const handleError = (message: string, status: number = 500): NextResponse => {
  console.error(message);
  return new NextResponse(message, { status });
};

// POST handler
export const POST = async (req: NextRequest) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return handleError('Unauthorized', 401);
    }

    await connectToDB();

    const body = await req.json();

    const product = new Product(body);
    await product.validate(); // Explicitly validate before saving
    await product.save();

    // Update collections if provided
    if (body.collections?.length) {
      const updateCollectionPromises = body.collections.map(
        async (collectionId: string) => {
          const collection = await Collection.findById(collectionId);
          if (collection) {
            collection.products.push(product._id);
            await collection.save();
          }
        }
      );
      await Promise.all(updateCollectionPromises);
    }
    revalidatePath('/products',);
    revalidatePath(`/products/${product._id}`,);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 400 }
    );
  }
};

// GET handler
export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filtering parameters
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const tags = searchParams.get('tags')?.split(',');
    const searchTerm = searchParams.get('search');

    // Build query
    const query: any = {};
    if (category) query.category = new mongoose.Types.ObjectId(category);
    if (subcategory)
      query.subcategories = new mongoose.Types.ObjectId(subcategory);
    if (tags) query.tags = { $in: tags };
    if (minPrice || maxPrice) {
      query['price.cny'] = {};
      if (minPrice) query['price.cny'].$gte = parseFloat(minPrice);
      if (maxPrice) query['price.cny'].$lte = parseFloat(maxPrice);
    }
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    // Fetch products and populate category & subcategories
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('subcategories', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Convert Mongoose documents to plain objects

    // Convert subcategories to an array of names
    const formattedProducts = products.map((product) => ({
      ...product,
      category: product.category?.name || 'Unknown',
      subcategories:
        product.subcategories?.map((sub: any) => sub.name).join(', ') || 'None',
    }));

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('[PRODUCTS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// Mark route as dynamic
export const dynamic = 'force-dynamic';
