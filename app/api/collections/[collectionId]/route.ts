import { connectToDB } from '@/lib/mongoDB';
import Collection from '@/lib/models/Collection';
import Product from '@/lib/models/Product';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';


export const GET = async (
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) => {
  try {
    await connectToDB();

    const collection = await Collection.findById(params.collectionId).populate({
      path: 'products',
      model: Product,
    });

    if (!collection) {
      return new NextResponse(
        JSON.stringify({ message: 'Collection not found' }),
        { status: 404 }
      );
    }

    return NextResponse.json(collection, { status: 200 });
  } catch (err) {
    console.log('[collectionId_GET]', err);
    return new NextResponse('Internal error', { status: 500 });
  }
};

export const POST = async (
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectToDB();

    let collection = await Collection.findById(params.collectionId);

    if (!collection) {
      return new NextResponse('Collection not found', { status: 404 });
    }

    const { title, description, icon, thumbnail } = await req.json();

    if (!title || !icon || !thumbnail) {
      return new NextResponse('Title, icon and thumbnail are required', {
        status: 400,
      });
    }

    collection = await Collection.findByIdAndUpdate(
      params.collectionId,
      { title, description, icon, thumbnail },
      { new: true }
    );

    await collection.save();
    revalidatePath('/collections');
    return NextResponse.json(collection, { status: 200 });
  } catch (err) {
    console.log('[collectionId_POST]', err);
    return new NextResponse('Internal error', { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectToDB();

    await Collection.findByIdAndDelete(params.collectionId);

    await Product.updateMany(
      { collections: params.collectionId },
      { $pull: { collections: params.collectionId } }
    );
    revalidatePath('/collections');
    return new NextResponse('Collection is deleted', { status: 200 });
    
  } catch (err) {
    console.log('[collectionId_DELETE]', err);
    return new NextResponse('Internal error', { status: 500 });
  }
};

export const dynamic = 'force-dynamic';
