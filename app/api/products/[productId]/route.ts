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

    // Create an update object with only the fields that are provided
    const updateFields: any = { ...product._doc };

    // List of all possible fields
    const allowedFields = [
      'title',
      'description',
      'media',
      'category',
      'collections',
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

    // Handle collections update only if collections field is provided
    if (updateData.collections !== undefined) {
      const addedCollections = updateData.collections.filter(
        (collectionId: string) => !product.collections.includes(collectionId)
      );

      const removedCollections = product.collections.filter(
        (collectionId: string) => !updateData.collections.includes(collectionId)
      );

      // Update collections
      await Promise.all([
        ...addedCollections.map((collectionId: string) =>
          Collection.findByIdAndUpdate(collectionId, {
            $push: { products: product._id },
          })
        ),
        ...removedCollections.map((collectionId: string) =>
          Collection.findByIdAndUpdate(collectionId, {
            $pull: { products: product._id },
          })
        ),
      ]);
    }

    // Update product with only the provided fields
    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      { $set: updateFields },
      { new: true }
    ).populate({ path: 'collections', model: Collection });

    await updatedProduct.save();
    revalidatePath('/products');
    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (err) {
    console.log('[productId_POST]', err);
    return new NextResponse('Internal error', { status: 500 });
  }
};
export const PUT = async (
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

    // Create an update object with only the fields that are provided
    const updateFields: any = { ...product._doc };

    // List of all possible fields
    const allowedFields = [
      'title',
      'description',
      'media',
      'category',
      'collections',
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

    // Handle collections update only if collections field is provided
    if (updateData.collections !== undefined) {
      const addedCollections = updateData.collections.filter(
        (collectionId: string) => !product.collections.includes(collectionId)
      );

      const removedCollections = product.collections.filter(
        (collectionId: string) => !updateData.collections.includes(collectionId)
      );

      // Update collections
      await Promise.all([
        ...addedCollections.map((collectionId: string) =>
          Collection.findByIdAndUpdate(collectionId, {
            $push: { products: product._id },
          })
        ),
        ...removedCollections.map((collectionId: string) =>
          Collection.findByIdAndUpdate(collectionId, {
            $pull: { products: product._id },
          })
        ),
      ]);
    }

    // Update product with only the provided fields
    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      { $set: updateFields },
      { new: true }
    ).populate({ path: 'collections', model: Collection });

    await updatedProduct.save();
    revalidatePath('/products');
    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (err) {
    console.log('[productId_PUT]', err);
    return new NextResponse('Internal error', { status: 500 });
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
