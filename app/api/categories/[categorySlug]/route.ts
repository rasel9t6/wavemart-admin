import { connectToDB } from '@/lib/mongoDB';
import Product from '@/lib/models/Product';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import Category from '@/lib/models/Category';

export const GET = async (
  req: NextRequest,
  { params }: { params: { categorySlug: string } }
) => {
  try {
    await connectToDB();

    const category = await Category.findOne({
      slug: params.categorySlug,
    }).populate({
      path: 'products',
      model: Product,
    });

    if (!category) {
      return new NextResponse(
        JSON.stringify({ message: 'Category not found' }),
        { status: 404 }
      );
    }

    return NextResponse.json(category, { status: 200 });
  } catch (err) {
    console.log('[categoryId_GET]', err);
    return new NextResponse('Internal error', { status: 500 });
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

    let category = await Category.findOne({ slug: params.categorySlug });

    if (!category) {
      return new NextResponse('Category not found', { status: 404 });
    }

    const {
      name,
      title,
      description,
      icon,
      thumbnail,
      isActive,
      slug,
      subcategories,
    } = await req.json();

    if (!name || !title || !icon || !thumbnail) {
      return new NextResponse('Title, icon and thumbnail are required', {
        status: 400,
      });
    }

    category = await Category.findOneAndUpdate(
      { slug: params.categorySlug },
      {
        name,
        title,
        description,
        icon,
        thumbnail,
        isActive,
        slug,
        subcategories,
      },
      { new: true }
    );

    await category.save();
    revalidatePath('/categories');
    return NextResponse.json(category, { status: 200 });
  } catch (err) {
    console.log('[categoryId_POST]', err);
    return new NextResponse('Internal error', { status: 500 });
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

    await Product.updateMany(
      { categories: category._id },
      { $pull: { categories: category._id } }
    );

    revalidatePath('/categories');
    return new NextResponse('category is deleted', { status: 200 });
  } catch (err) {
    console.log('[CategoryId_DELETE]', err);
    return new NextResponse('Internal error', { status: 500 });
  }
};

export const dynamic = 'force-dynamic';
