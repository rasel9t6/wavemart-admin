import Collection from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import { connectToDB } from '@/lib/mongoDB';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await connectToDB();

    // Use lean() to get a plain JavaScript object and populate any necessary fields
    const product = await Product.findById(params.productId).lean() as any;

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Ensure the response is properly structured
    const response = {
      ...product,
      quantityPricing: product.quantityPricing || [],
      price: product.price || {},
      expense: product.expense || {},
      currencyRates: product.currencyRates || {},
      media: product.media || [],
      tags: product.tags || [],
      sizes: product.sizes || [],
      colors: product.colors || [],
      collections: product.collections || [],
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// export const POST = async (
//   req: NextRequest,
//   { params }: { params: { productId: string } }
// ) => {
//   try {
//     const { userId } = auth();
//     if (!userId) {
//       return new NextResponse('Unauthorized', { status: 401 });
//     }

//     await connectToDB();
//     const product = await Product.findById(params.productId);

//     if (!product) {
//       return new NextResponse(
//         JSON.stringify({ message: 'Product not found' }),
//         { status: 404 }
//       );
//     }

//     const updateData = await req.json();

//     // Handle collections separately
//     const currentCollections = [...product.collections];

//     // Create update object without collections first
//     const updateFields: { [key: string]: any } = {};
//     const allowedFields = [
//       'title',
//       'description',
//       'media',
//       'category',
//       'tags',
//       'sizes',
//       'colors',
//       'price',
//       'expense',
//     ];

//     // Only include fields that are actually provided in the request
//     allowedFields.forEach((field) => {
//       if (updateData[field] !== undefined) {
//         updateFields[field] = updateData[field];
//       }
//     });

//     // Update the product first
//     const updatedProduct = await Product.findByIdAndUpdate(
//       params.productId,
//       { $set: updateFields },
//       { new: true, runValidators: true }
//     );

//     // Handle collections update if provided
//     if (updateData.collections !== undefined) {
//       // Update the collections array separately
//       await Product.findByIdAndUpdate(
//         params.productId,
//         { $set: { collections: updateData.collections } },
//         { new: true, runValidators: true }
//       );

//       const addedCollections = updateData.collections.filter(
//         (collectionId: string) =>
//           !currentCollections.map((c) => c.toString()).includes(collectionId)
//       );

//       const removedCollections = currentCollections
//         .map((c) => c.toString())
//         .filter(
//           (collectionId: string) =>
//             !updateData.collections.includes(collectionId)
//         );

//       // Update collections
//       await Promise.all([
//         ...addedCollections.map((collectionId: string) =>
//           Collection.findByIdAndUpdate(collectionId, {
//             $addToSet: { products: product._id },
//           })
//         ),
//         ...removedCollections.map((collectionId: string) =>
//           Collection.findByIdAndUpdate(collectionId, {
//             $pull: { products: product._id },
//           })
//         ),
//       ]);
//     }
//     revalidatePath('/products');
//     return new NextResponse(JSON.stringify(updatedProduct), { status: 200 });
//   } catch (error) {
//     console.error('[PRODUCT_UPDATE]', error);
//     return new NextResponse(
//       JSON.stringify({ message: 'Internal server error' }),
//       { status: 500 }
//     );
//   }
// };

export async function PATCH(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await connectToDB();
    const body = await req.json();

    const product = await Product.findById(params.productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update currency rates if provided
    if (body.currencyRates) {
      await product.updateCurrencyRates(
        body.currencyRates.usdToCny,
        body.currencyRates.cnyToBdt
      );
      delete body.currencyRates; // Remove from body to prevent double update
    }

    // Update other fields
    Object.assign(product, body);
    await product.validate();
    await product.save();

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 400 }
    );
  }
}
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
