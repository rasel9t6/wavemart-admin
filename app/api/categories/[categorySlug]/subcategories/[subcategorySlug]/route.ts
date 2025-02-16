import Category from '@/lib/models/Category';
import Subcategory from '@/lib/models/Subcategory';
import { connectToDB } from '@/lib/mongoDB';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { categoryId: string; subcategoryId: string } }
) {
  try {
    await connectToDB();

    const subcategory = await Subcategory.findById(params.subcategoryId);

    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subcategory);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subcategory' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { categoryId: string; subcategoryId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await req.json();

    const subcategory = await Subcategory.findByIdAndUpdate(
      params.subcategoryId,
      { ...data },
      { new: true, runValidators: true }
    );

    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      );
    }
    revalidatePath(`/categories/${params.categoryId}`);
    return NextResponse.json(subcategory);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update subcategory' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { categoryId: string; subcategoryId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectToDB();

    // Find and delete the subcategory
    const subcategory = await Subcategory.findByIdAndDelete(
      params.subcategoryId
    );

    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      );
    }

    // Remove subcategory reference from parent category
    await Category.findOneAndUpdate(
      { slug: params.categoryId },
      { $pull: { subcategories: params.subcategoryId } }
    );

    return NextResponse.json({ message: 'Subcategory deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete subcategory' },
      { status: 500 }
    );
  }
}
