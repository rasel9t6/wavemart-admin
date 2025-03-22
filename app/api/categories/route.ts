import cors from '@/lib/cros';
import { connectToDB } from '@/lib/mongoDB';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';

import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();

    const data = await req.json();

    // Create the main category first
    const categoryData = {
      name: data.name,
      title: data.title,
      description: data.description,
      icon: data.icon,
      thumbnail: data.thumbnail,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      shippingCharge: data.shippingCharge,
    };

    const category = await Category.create(categoryData);

    // Create subcategories if any
    if (data.subcategories && data.subcategories.length > 0) {
      const subcategoryPromises = data.subcategories.map(async (sub: any) => {
        const subcategoryData = {
          name: sub.name,
          title: sub.title,
          description: sub.description,
          icon: sub.icon,
          thumbnail: sub.thumbnail,
          isActive: sub.isActive,
          category: category._id,
          shippingCharge: sub.shippingCharge,
        };
        const subcategory = await Subcategory.create(subcategoryData);
        return subcategory._id;
      });

      const subcategoryIds = await Promise.all(subcategoryPromises);
      category.subcategories = subcategoryIds;
      await category.save();
    }
    revalidatePath('/categories');
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.log('[Category_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  try {
    
    // Get CORS headers
    const corsHeaders = cors(req);

    await connectToDB();

    const categories = await Category.find()
      .populate({
        path: 'subcategories',
        model: Subcategory,
      })
      .sort({ sortOrder: 1 })
      .lean();
  
    // Return response with CORS headers
    return new NextResponse(JSON.stringify(categories), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error('[Categories_GET]', error);

    // Also include CORS headers in error responses
    const corsHeaders = cors(req);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Failed to fetch categories' }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
};

export const dynamic = 'force-dynamic';
