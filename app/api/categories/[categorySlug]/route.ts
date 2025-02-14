import { connectToDB } from '@/lib/mongoDB';
import Product from '@/lib/models/Product';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import Category from '@/lib/models/Category';
import { Types } from 'mongoose';

// Match your exact model structure
interface Subcategory {
  _id?: string;
  name: string;
  title: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  products: Types.ObjectId[];
  slug: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CategoryDocument {
  _id: Types.ObjectId;
  name: string;
  title: string;
  slug: string;
  description?: string;
  icon: string;
  thumbnail: string;
  subcategories: Subcategory[];
  products: Types.ObjectId[];
  isActive: boolean;
  sortOrder: number;
  metadata: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

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
        path: 'products',
        model: Product,
      })
      .populate('subcategories.products')
      .lean<CategoryDocument>();

    if (!category) {
      return new NextResponse(
        JSON.stringify({ message: 'Category not found' }),
        { status: 404 }
      );
    }

    // Ensure subcategories is always an array
    const formattedCategory = {
      ...category,
      subcategories: category.subcategories || [],
    };

    return NextResponse.json(formattedCategory, { status: 200 });
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
    const category = await Category.findOne({ slug: params.categorySlug });

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
      subcategories,
      sortOrder,
      metadata = {},
    } = await req.json();

    if (!name || !title || !icon || !thumbnail) {
      return new NextResponse('Name, title, icon and thumbnail are required', {
        status: 400,
      });
    }

    // Generate slug from name if not provided
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Process subcategories to ensure they have slugs
    const processedSubcategories = (subcategories || []).map(
      (sub: Subcategory) => ({
        ...sub,
        slug: sub.slug || sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        isActive: sub.isActive ?? true,
      })
    );

    const updatedCategory = await Category.findOneAndUpdate(
      { slug: params.categorySlug },
      {
        name,
        title,
        description,
        icon,
        thumbnail,
        isActive,
        slug,
        subcategories: processedSubcategories,
        sortOrder: sortOrder || 0,
        metadata: new Map(Object.entries(metadata)),
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean<CategoryDocument>();

    revalidatePath('/categories');

    // Format the response
    const formattedResponse = {
      ...updatedCategory,
      metadata: Object.fromEntries(updatedCategory?.metadata || new Map()),
    };

    return NextResponse.json(formattedResponse, { status: 200 });
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

    // Clean up products references
    await Product.updateMany(
      { categories: category._id },
      { $pull: { categories: category._id } }
    );

    revalidatePath('/categories');
    return new NextResponse('Category deleted successfully', { status: 200 });
  } catch (err) {
    console.log('[CategoryId_DELETE]', err);
    return new NextResponse('Internal error', { status: 500 });
  }
};

export const dynamic = 'force-dynamic';
