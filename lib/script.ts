import { connectToDB } from '@/lib/mongoDB';
import Category from '@/lib/models/Category';
import Subcategory from '@/lib/models/Subcategory';

async function migrateSubcategories() {
  try {
    await connectToDB();

    const categories = await Category.find({});

    for (const category of categories) {
      const oldSubcategories = category.subcategories || [];

      // Create new subcategory documents
      const newSubcategoryIds = await Promise.all(
        oldSubcategories.map(async (oldSub: any) => {
          const newSub = new Subcategory({
            ...oldSub,
            category: category._id,
          });
          await newSub.save();
          return newSub._id;
        })
      );

      // Update category with new subcategory references
      category.subcategories = newSubcategoryIds;
      await category.save();
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateSubcategories();
