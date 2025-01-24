'use server';

import Collection from '@/lib/models/Collection';
import { connectToDB } from '@/lib/mongoDB';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

// Helper function to validate input
const validateCollectionInput = (data: { title: string; image: string }) => {
  const { title, image } = data;

  if (!title?.trim() || !image?.trim()) {
    throw new Error('Title and image are required');
  }
};

// Server action to create a new collection
export const createCollection = async (data: {
  title: string;
  description?: string;
  image: string;
}) => {
  try {
    // Ensure the user is authenticated
    const { userId } = auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    await connectToDB();

    const { title, description, image } = data;

    // Validate input
    validateCollectionInput({ title, image });

    // Check if the collection already exists
    const existingCollection = await Collection.findOne({ title }, { _id: 1 });
    if (existingCollection) {
      throw new Error('Collection already exists');
    }

    // Create and save the new collection
    const newCollection = await Collection.create({
      title,
      description,
      image,
    });

    // Revalidate the path to reflect the new collection
    revalidatePath('/collections');

    // Return the new collection as a plain object
    return newCollection;
  } catch (error: any) {
    console.error('[createCollection]', error.message);
    throw new Error(error.message || 'Internal Server Error');
  }
};

// Server action to fetch collections
export const getCollections = async () => {
  try {
    await connectToDB();

    // Fetch collections, sort them by creation date, and return as plain objects
    const collections = await Collection.find({})
      .sort({ createdAt: -1 })
      .lean();
    console.log(collections);
    return collections;
  } catch (error: any) {
    console.error('[getCollections]', error.message);
    throw new Error('Internal Server Error');
  }
};
