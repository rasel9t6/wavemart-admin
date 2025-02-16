import { connectToDB } from '@/lib/mongoDB';
import Category from '@/lib/models/Category';
import Subcategory from '@/lib/models/Subcategory';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function GET(
  req: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    await connectToDB();

    const category = await Category.findOne({ slug: params.categoryId });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const subcategories = await Subcategory.find({ category: category._id });
    return NextResponse.json(subcategories);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subcategories' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectToDB();
    const data = await req.json();
    const category = await Category.findOne({ slug: params.categoryId });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const subcategory = await Subcategory.create({
      ...data,
      category: category._id,
    });

    // Update category's subcategories array
    category.subcategories.push(subcategory._id);
    await category.save();
    revalidatePath(`/categories/${params.categoryId}`);
    return NextResponse.json(subcategory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create subcategory' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
