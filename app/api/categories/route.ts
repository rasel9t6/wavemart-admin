import Category from '@/lib/models/Category';
import Subcategory from '@/lib/models/Subcategory';
import { connectToDB } from '@/lib/mongoDB';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 }); // Changed from 403 to 401 for unauthorized
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

export const GET = async () => {
  try {
    await connectToDB();
    const categories = await Category.find()
      .populate({
        path: 'subcategories',
        model: Subcategory, // Ensure this matches your Subcategory model name
      })
      .sort({ sortOrder: 1 })
      .lean();

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('[Categories_GET]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
};

export const dynamic = 'force-dynamic';
