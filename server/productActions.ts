'use server';

import Product from '@/lib/models/Product';
import { connectToDB } from '@/lib/mongoDB';
import Collection from '@/lib/models/Collection';
import { ProductType } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Convert a Mongoose document to a plain ProductType object.
 * @param product - The raw product document.
 * @returns A plain ProductType object.
 */
function convertToPlainProduct(product: any): ProductType {
  return {
    ...product,
    _id: product._id.toString(), // Convert ObjectId to string
    price: parseFloat(product.price?.toString() || '0'), // Convert Decimal128 to number
    expense: parseFloat(product.expense?.toString() || '0'), // Convert Decimal128 to number
    createdAt: new Date(product.createdAt), // Ensure createdAt is a Date object
    updatedAt: new Date(product.updatedAt), // Ensure updatedAt is a Date object
    collections: product.collections.map((collection: any) => ({
      ...collection,
      _id: collection._id.toString(), // Convert ObjectId to string
    })),
  };
}

/**
 * Fetch product details by productId and return a plain object.
 * @param productId - The ID of the product to fetch.
 * @returns A plain ProductType object or null if the product is not found.
 */
export async function getProductDetails(
  productId: string
): Promise<ProductType | null> {
  await connectToDB();

  // Fetch the product and populate collections
  const product = await Product.findById(productId)
    .populate({
      path: 'collections',
      model: Collection,
    })
    .lean();

  if (!product) return null;

  // Convert to plain ProductType
  const plainProduct = convertToPlainProduct(product);

  // Revalidate necessary paths
  revalidatePaths(productId);

  return plainProduct;
}

/**
 * Revalidate paths related to the product.
 * @param productId - The ID of the product.
 */
function revalidatePaths(productId: string) {
  const paths = [
    `/products`,
    `/products/${productId}`,
    `/api/products/${productId}`,
  ];

  paths.forEach((path) => revalidatePath(path));
}
