'use server';

import Collection from '@/lib/models/Collection';
import { connectToDB } from '@/lib/mongoDB';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import image from 'next/image';
import { redirect } from 'next/navigation';

// Helper function to validate input
const validateCollectionInput = (data: {
  title: string;
  icon: string;
  thumbnail: string;
}) => {
  const { title, icon, thumbnail } = data;

  if (!title?.trim() || !icon?.trim() || !thumbnail?.trim()) {
    throw new Error('Title and image are required');
  }
};

// Server action to create a new collection
export const createCollection = async (data: {
  title: string;
  description?: string;
  icon: string;
  thumbnail: string;
}) => {
  try {
    // Ensure the user is authenticated
    const { userId } = auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    await connectToDB();

    const { title, description, icon, thumbnail } = data;

    // Validate input
    validateCollectionInput({ title, icon, thumbnail });

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
    redirect('/collections');

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
    return JSON.parse(JSON.stringify(collections)) as typeof collections;
  } catch (error: any) {
    console.error('[getCollections]', error.message);
    throw new Error('Internal Server Error');
  }
};
