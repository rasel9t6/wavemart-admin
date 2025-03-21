import { connectToDB } from '@/lib/mongoDB';

import { NextRequest, NextResponse } from 'next/server';

import { revalidatePath } from 'next/cache';

import mongoose from 'mongoose';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Subcategory from '@/models/Subcategory';

export const GET = async (
  req: NextRequest,
  { params }: { params: { categorySlug: string[] } }
) => {
  try {
    await connectToDB();
    const slugPath = params.categorySlug;

    // If it's a top-level category
    if (slugPath.length === 1) {
      const category = await Category.findOne({
        slug: slugPath[0],
      })
        .populate({
          path: 'subcategories',
          model: Subcategory,
        })
        .populate('products')
        .lean();

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }

      revalidatePath(`/categories/${slugPath[0]}`);
      return NextResponse.json(category);
    }
    // If it's a subcategory
    else if (slugPath.length === 2) {
      const parentCategory = await Category.findOne({ slug: slugPath[0] });

      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 404 }
        );
      }

      const subcategory = await Subcategory.findOne({
        category: parentCategory._id,
        slug: slugPath[1],
      })
        .populate('products')
        .lean();

      if (!subcategory) {
        return NextResponse.json(
          { error: 'Subcategory not found' },
          { status: 404 }
        );
      }

      revalidatePath(`/categories/${slugPath[0]}/${slugPath[1]}`);
      return NextResponse.json(subcategory);
    }

    return NextResponse.json(
      { error: 'Invalid category path' },
      { status: 400 }
    );
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
  { params }: { params: { categorySlug: string[] } }
) => {
  try {
   

    await connectToDB();
    const data = await req.json();
    const slugPath = params.categorySlug;

    // We only support updating top-level categories via this endpoint
    if (slugPath.length !== 1) {
      return NextResponse.json(
        { error: 'Invalid category path for update' },
        { status: 400 }
      );
    }

    const category = await Category.findOne({ slug: slugPath[0] });

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
    revalidatePath(`/categories/${slugPath[0]}`);

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
  { params }: { params: { categorySlug: string[] } }
) => {
  try {
   

    await connectToDB();
    const slugPath = params.categorySlug;

    // We only support deleting top-level categories via this endpoint
    if (slugPath.length !== 1) {
      return NextResponse.json(
        { error: 'Invalid category path for deletion' },
        { status: 400 }
      );
    }

    const category = await Category.findOne({ slug: slugPath[0] });

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
