import cors from '@/lib/cros';
import Category from '@/lib/models/Category';
import Subcategory from '@/lib/models/Subcategory';
import { connectToDB } from '@/lib/mongoDB';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

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
    // Check API key
    const apiKey = req.headers.get('x-api-key');

    // Validate API key
    if (!apiKey || apiKey !== process.env.STORE_API_KEY) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Allow CORS from your store domain
    const corsHeaders = cors(req, [process.env.STORE_URL as string]);

    await connectToDB();
    const categories = await Category.find()
      .populate({
        path: 'subcategories',
        model: Subcategory,
      })
      .sort({ sortOrder: 1 })
      .lean();

    // Return response with CORS headers
    return NextResponse.json(categories, {
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error('[Public_Categories_GET]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
};

export const dynamic = 'force-dynamic';
