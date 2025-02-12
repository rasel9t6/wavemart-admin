import CategoryForm from '@/components/categories/CategoryForm';
import { Metadata } from 'next';

// Types
interface CategoryParams {
  categorySlug: string;
}

// API Service
const CategoryService = {
  async getCategoryBySlug(slug: string) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_E_COMMERCE_ADMIN_URL;
      const response = await fetch(`${baseUrl}/api/categories/${slug}`);
      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  },
};

// Metadata generator
const generateCategoryMetadata = (category: any): Metadata => ({
  title: category?.title || 'Category Not Found',
  description: category?.description,
  keywords: category?.name,
  openGraph: category
    ? {
        title: category.title,
        description: category.description,
        images: [category.thumbnail],
      }
    : undefined,
});

export async function generateMetadata({
  params,
}: {
  params: CategoryParams;
}): Promise<Metadata> {
  const category = await CategoryService.getCategoryBySlug(params.categorySlug);
  return generateCategoryMetadata(category);
}

// Page component
export default async function CategoryDetailsPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const slug = (await params).categorySlug;
  const category = await CategoryService.getCategoryBySlug(slug);

  return <CategoryForm initialData={category} />;
}
