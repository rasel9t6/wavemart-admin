import Category from '@/lib/models/Category';
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
    const { name, title, description, icon, thumbnail } = await req.json();

    if (!name || !title || !icon || !thumbnail) {
      return new NextResponse('Name, title, icon and thumbnail are required', {
        status: 400,
      });
    }

    // Generate a slug from the title
    const slug = title.toLowerCase().replace(/\s+/g, '-');

    // Check for existing category by both title and slug
    const existingCategory = await Category.findOne({
      $or: [{ title }, { slug }],
    });

    if (existingCategory) {
      return new NextResponse('Category already exists', { status: 400 });
    }

    const newCategory = await Category.create({
      name,
      title,
      description,
      icon,
      thumbnail,
      slug, // Add the slug field
    });

    revalidatePath('/categories');
    return NextResponse.json(newCategory, { status: 201 }); // Changed to 201 for resource creation
  } catch (error) {
    console.log('[Category_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const GET = async () => {
  try {
    await connectToDB();
    const categories = await Category.find()
      .select('name title description icon thumbnail slug') // Explicitly select fields
      .sort({ createdAt: -1 }); // Use -1 instead of 'desc' for consistency

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.log('[Categories_GET]', error); // Updated log message to be more specific
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const dynamic = 'force-dynamic';
