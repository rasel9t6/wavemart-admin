import { connectToDB } from '@/lib/mongoDB';
import Product from '@/lib/models/Product';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import Category from '@/lib/models/Category';
import Subcategory from '@/lib/models/Subcategory';

export const GET = async (
  req: NextRequest,
  { params }: { params: { categorySlug: string } }
) => {
  try {
    await connectToDB();
    const category = await Category.findOne({
      slug: params.categorySlug,
    })
      .populate({
        path: 'subcategories',
        model: 'Subcategory',
        select: '-__v',
      })
      .lean();

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch category' },
      { status: 500 }
    );
  }
};

export const POST = async (
  req: NextRequest,
  { params }: { params: { categorySlug: string } }
) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectToDB();
    const data = await req.json();
    const category = await Category.findOne({ slug: params.categorySlug });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Update main category fields
    category.name = data.name;
    category.title = data.title;
    category.description = data.description;
    category.icon = data.icon;
    category.thumbnail = data.thumbnail;
    category.isActive = data.isActive;
    category.sortOrder = data.sortOrder;

    // Handle subcategories
    if (data.subcategories) {
      // Remove existing subcategories
      await Subcategory.deleteMany({ category: category._id });

      // Create new subcategories
      const subcategoryPromises = data.subcategories.map(async (sub: any) => {
        const subcategoryData = {
          name: sub.name,
          title: sub.title,
          description: sub.description,
          icon: sub.icon,
          thumbnail: sub.thumbnail,
          isActive: sub.isActive,
          category: category._id,
        };
        const subcategory = await Subcategory.create(subcategoryData);
        return subcategory._id;
      });

      const subcategoryIds = await Promise.all(subcategoryPromises);
      category.subcategories = subcategoryIds;
    }

    await category.save();
    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update category' },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { categorySlug: string } }
) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectToDB();
    const category = await Category.findOne({ slug: params.categorySlug });

    if (!category) {
      return new NextResponse('Category not found', { status: 404 });
    }

    await Category.findOneAndDelete({ slug: params.categorySlug });

    // Clean up product references
    await Product.updateMany(
      { categories: category._id },
      { $pull: { categories: category._id } }
    );
    // Delete associated subcategories
    await Subcategory.deleteMany({ category: category._id });

    // Delete the category
    await category.deleteOne();
    revalidatePath('/categories');
    return new NextResponse('Category deleted successfully', { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
};

export const dynamic = 'force-dynamic';
