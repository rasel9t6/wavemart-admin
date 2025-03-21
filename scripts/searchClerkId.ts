import { connectToDB } from '../lib/mongoDB';
import mongoose from 'mongoose';
 // Adjust the path as needed

export const findClerkIdInAllCollections = async () => {
  await connectToDB();

  // Ensure the database is connected before proceeding
  if (!mongoose.connection.readyState) {
    console.log('Failed to connect to MongoDB');
    return;
  }

  const db = mongoose.connection;

  try {
    // Get all collection names in the current database
    const collections = await db.db?.listCollections().toArray(); // Use optional chaining

    if (collections) {
      for (const collection of collections) {
        const collectionName = collection.name;

        // Count documents containing clerkId
        const count = await db
          .collection(collectionName)
          .countDocuments({ clerkId: { $exists: true } });

        if (count > 0) {
          console.log(
            `${collectionName}: ${count} documents found with clerkId`
          );
        }
      }
    } else {
      console.log('No collections found.');
    }
  } catch (error) {
    console.error('Error while searching for clerkId:', error);
  } finally {
    await mongoose.connection.close(); // Close the database connection after the operation
  }
};

// Execute the function
findClerkIdInAllCollections().catch((err) =>
  console.error('An error occurred:', err)
);

