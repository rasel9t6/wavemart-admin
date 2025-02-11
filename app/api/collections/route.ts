import Collection from '@/lib/models/Collection';
import { connectToDB } from '@/lib/mongoDB';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    await connectToDB();

    const { name, title, description, icon, thumbnail } = await req.json();

    const existingCollection = await Collection.findOne({ title });

    if (existingCollection) {
      return new NextResponse('Collection already exists', { status: 400 });
    }

    if (!title || !icon || !thumbnail) {
      return new NextResponse('Title, icon and thumbnail are required', {
        status: 400,
      });
    }

    const newCollection = await Collection.create({
      name,
      title,
      description,
      icon,
      thumbnail,
    });
    revalidatePath('/collections');
    await newCollection.save();

    return NextResponse.json(newCollection, { status: 200 });
  } catch (error) {
    console.log('[collection_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const GET = async () => {
  try {
    await connectToDB();
    const collections = await Collection.find().sort({ createdAt: 'desc' });
    return NextResponse.json(collections, { status: 200 });
  } catch (error) {
    console.log('[collection_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
export const dynamic = 'force-dynamic';
