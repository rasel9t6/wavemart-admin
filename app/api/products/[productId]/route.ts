import Collection from '@/lib/models/Collection';
import Product from '@/lib/models/Product';
import { connectToDB } from '@/lib/mongoDB';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  req: NextRequest,
  { params }: { params: { productId: string } }
) => {
  try {
    await connectToDB();

    const product = await Product.findById(params.productId)
      .populate({
        path: 'collections',
        model: Collection,
      })
      .lean();
    console.log(product);
    if (!product) {
      return new NextResponse(
        JSON.stringify({ message: 'Product not found' }),
        { status: 404 }
      );
    }
    return new NextResponse(JSON.stringify(product), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': `${process.env.ECOMMERCE_STORE_URL}`,
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (err) {
    console.log('[productId_GET]', err);
    return new NextResponse('Internal error', { status: 500 });
  }
};

export const POST = async (
  req: NextRequest,
  { params }: { params: { productId: string } }
) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectToDB();
    const product = await Product.findById(params.productId);

    if (!product) {
      return new NextResponse(
        JSON.stringify({ message: 'Product not found' }),
        { status: 404 }
      );
    }

    const updateData = await req.json();

    // Handle collections separately
    const currentCollections = [...product.collections];

    // Create update object without collections first
    const updateFields: { [key: string]: any } = {};
    const allowedFields = [
      'title',
      'description',
      'media',
      'category',
      'tags',
      'sizes',
      'colors',
      'price',
      'expense',
    ];

    // Only include fields that are actually provided in the request
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    });

    // Update the product first
    const updatedProduct = await Product.findByIdAndUpdate(
      params.productId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    // Handle collections update if provided
    if (updateData.collections !== undefined) {
      // Update the collections array separately
      await Product.findByIdAndUpdate(
        params.productId,
        { $set: { collections: updateData.collections } },
        { new: true, runValidators: true }
      );

      const addedCollections = updateData.collections.filter(
        (collectionId: string) =>
          !currentCollections.map((c) => c.toString()).includes(collectionId)
      );

      const removedCollections = currentCollections
        .map((c) => c.toString())
        .filter(
          (collectionId: string) =>
            !updateData.collections.includes(collectionId)
        );

      // Update collections
      await Promise.all([
        ...addedCollections.map((collectionId: string) =>
          Collection.findByIdAndUpdate(collectionId, {
            $addToSet: { products: product._id },
          })
        ),
        ...removedCollections.map((collectionId: string) =>
          Collection.findByIdAndUpdate(collectionId, {
            $pull: { products: product._id },
          })
        ),
      ]);
    }
    revalidatePath('/products');
    return new NextResponse(JSON.stringify(updatedProduct), { status: 200 });
  } catch (error) {
    console.error('[PRODUCT_UPDATE]', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500 }
    );
  }
};
export const DELETE = async (
  req: NextRequest,
  { params }: { params: { productId: string } }
) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectToDB();

    const product = await Product.findById(params.productId);

    if (!product) {
      return new NextResponse(
        JSON.stringify({ message: 'Product not found' }),
        { status: 404 }
      );
    }

    await Product.findByIdAndDelete(product._id);

    // Update collections
    await Promise.all(
      product.collections.map((collectionId: string) =>
        Collection.findByIdAndUpdate(collectionId, {
          $pull: { products: product._id },
        })
      )
    );
    revalidatePath('/products');
    return new NextResponse(JSON.stringify({ message: 'Product deleted' }), {
      status: 200,
    });
  } catch (err) {
    console.log('[productId_DELETE]', err);
    return new NextResponse('Internal error', { status: 500 });
  }
};

export const dynamic = 'force-dynamic';
