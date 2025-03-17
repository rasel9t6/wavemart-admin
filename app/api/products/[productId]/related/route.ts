import Product from '@/lib/models/Product';
import { connectToDB } from '@/lib/mongoDB';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  req: NextRequest,
  { params }: { params: { productId: string } }
) => {
  try {
    await connectToDB();
    // Find product by slug
    const product = await Product.findOne({ slug: params.productId });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Create a query to find related products based on category
    const query: any = {
      _id: { $ne: product._id }, // Exclude the current product
    };

    // If product has a category, find products with the same category
    if (product.category) {
      query.category = product.category;
    }
    // If there's no category, try to match by tags
    else if (product.tags && product.tags.length > 0) {
      query.tags = { $in: product.tags };
    }
    // As a last resort, match by price range
    else if (product.price && product.price.bdt) {
      const price = product.price.bdt;
      const minPrice = price * 0.7; // 30% lower
      const maxPrice = price * 1.3; // 30% higher

      query['price.bdt'] = {
        $gte: minPrice,
        $lte: maxPrice,
      };
    }

    console.log('Related products query:', query);

    // Get related products, limit to 8
    const relatedProducts = await Product.find(query).limit(8).lean();

    console.log(
      `Found ${relatedProducts.length} related products for: ${params.productId}`
    );

    return NextResponse.json(relatedProducts);
  } catch (error: any) {
    console.error('[RELATED_PRODUCTS_GET]', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch related products' },
      { status: 500 }
    );
  }
};

export const dynamic = 'force-dynamic';
