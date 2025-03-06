import { connectToDB } from '@/lib/mongoDB';
import Product from '@/lib/models/Product';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import Category from '@/lib/models/Category';
import Subcategory from '@/lib/models/Subcategory';
import mongoose from 'mongoose';

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
        model: Subcategory,
      })
      .populate('products')
      .lean(); // Use lean for better performance

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    revalidatePath(`/categories/${params.categorySlug}`);
    return NextResponse.json(category);
  } catch (error: any) {
    console.error('[CATEGORY_GET]', error);
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
    category.shippingCharge = data.shippingCharge;

    // Handle subcategories
    if (data.subcategories && Array.isArray(data.subcategories)) {
      // Remove existing subcategories
      await Subcategory.deleteMany({ category: category._id });

      // Create new subcategories with validation
      const subcategoryPromises = data.subcategories
        .filter((sub: any) => sub.name && sub.title) // Basic validation
        .map(async (sub: any) => {
          const subcategoryData = {
            name: sub.name,
            title: sub.title,
            description: sub.description || '',
            icon: sub.icon || '',
            thumbnail: sub.thumbnail || '',
            isActive: sub.isActive ?? true,
            category: category._id,
            sortOrder: sub.sortOrder || 0,
            shippingCharge: sub.shippingCharge || 0,
          };

          // Validate subcategory data before creation
          const subcategory = new Subcategory(subcategoryData);
          await subcategory.validate(); // Ensures data meets schema requirements

          return subcategory.save();
        });

      const savedSubcategories = await Promise.all(subcategoryPromises);

      // Update category with new subcategory references
      category.subcategories = savedSubcategories.map((sub) => sub._id);
    } else {
      // Clear subcategories if no valid data is provided
      category.subcategories = [];
    }

    await category.save();

    // Revalidate the categories path
    revalidatePath('/categories');

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('[CATEGORY_UPDATE]', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to update category',
        details: error.errors, // Mongoose validation error details
      },
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

    // Start a transaction for atomic operations
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Remove category references from products
      await Product.updateMany(
        { categories: category._id },
        { $pull: { categories: category._id } },
        { session }
      );

      // Delete associated subcategories
      await Subcategory.deleteMany({ category: category._id }, { session });

      // Delete the category
      await category.deleteOne({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      // Rollback the transaction if any operation fails
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

    revalidatePath('/categories');
    return new NextResponse('Category deleted successfully', { status: 200 });
  } catch (error: any) {
    console.error('[CATEGORY_DELETE]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
};

export const dynamic = 'force-dynamic';
