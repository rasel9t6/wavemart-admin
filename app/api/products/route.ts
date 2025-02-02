import Collection from '@/lib/models/Collection';
import Product from '@/lib/models/Product';
import { connectToDB } from '@/lib/mongoDB';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const handleError = (message: string, status: number = 500): NextResponse => {
  console.error(message);
  return new NextResponse(message, { status });
};

// POST handler
export const POST = async (req: NextRequest) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return handleError('Unauthorized', 401);
    }

    await connectToDB();

    const body = await req.json();
    const requiredFields = [
      'title',
      'description',
      'media',
      'category',
      'price',
      'expense',
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return handleError(
        `Missing required fields: ${missingFields.join(', ')}`,
        400
      );
    }

    const {
      title,
      description,
      media,
      category,
      collections,
      tags,
      sizes,
      colors,
      price,
      expense,
    } = body;

    // Create the product
    const newProduct = new Product({
      title,
      description,
      media,
      category,
      collections,
      tags,
      sizes,
      colors,
      price,
      expense,
    });
    await newProduct.save();

    // Update collections if provided
    if (collections?.length) {
      const updateCollectionPromises: Promise<void>[] = collections.map(
        async (collectionId: string): Promise<void> => {
          const collection = await Collection.findById(collectionId);
          if (collection) {
            collection.products.push(newProduct._id);
            await collection.save();
          }
        }
      );
      await Promise.all(updateCollectionPromises);
    }
    revalidatePath('/products');
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return handleError(`[products_POST]: ${(error as Error).message}`);
  }
};

// GET handler
export const GET = async () => {
  try {
    await connectToDB();

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate({ path: 'collections', model: Collection });

    return NextResponse.json(products, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.ECOMMERCE_STORE_URL || '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return handleError(`[products_GET]: ${(error as Error).message}`);
  }
};

// Mark route as dynamic
export const dynamic = 'force-dynamic';
