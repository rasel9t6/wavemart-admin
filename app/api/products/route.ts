import { connectToDB } from '@/lib/mongoDB';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Subcategory from '@/models/Subcategory';

import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';


// POST handler
export const POST = async (req: NextRequest) => {
  try {
   

    await connectToDB();

    const body = await req.json();

    const product = new Product(body);
    await product.validate(); // Explicitly validate before saving
    await product.save();

    // Update collections if provided
    if (body.categories?.length) {
      const updateCategoryPromises = body.categories.map(
        async (categoryId: string) => {
          const category = await Category.findOne({ slug: categoryId });
          if (category) {
            category.products.push(product._id);
            await category.save();
          }
        }
      );
      await Promise.all(updateCategoryPromises);
    }
    revalidatePath('/products');
    revalidatePath(`/products/${product._id}`);
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
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const tags = searchParams.get('tags')?.split(',');
    const searchTerm = searchParams.get('search');

    // Build query
    const query: any = {};
    if (category) {
      // Assuming category is an ObjectId
      query.category = new mongoose.Types.ObjectId(category);
    }
    if (tags) {
      query.tags = { $in: tags };
    }
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

    console.log('Query:', query); // Log the query for debugging

    // Fetch products and populate category and its subcategories
    const products = await Product.find(query)
      .populate({
        path: 'category',
        model: Category,
        populate: {
          path: 'subcategories',
          model: Subcategory,
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('[PRODUCTS_GET]', error.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// Mark route as dynamic
export const dynamic = 'force-dynamic';
