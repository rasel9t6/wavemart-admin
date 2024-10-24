'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

import DataTable from '@/components/custom-ui/DataTable';
import Loader from '@/components/custom-ui/Loader';
import { columns } from '@/components/products/ProductColumns';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function ProductPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductType[]>([]);
  const router = useRouter();

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false); 
    }
  };

  // Fetch products when the component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between">
        <p className="text-heading2-bold">Products</p>
        <Button
          className="bg-blue-1 text-white"
          onClick={() => router.push('/products/new')}
        >
          <Plus className="mr-2 size-4" />
          Create Product
        </Button>
      </div>
      <Separator className="my-4 bg-gray-1" />
      <DataTable columns={columns} data={products} searchKey="title" />
    </div>
  );
}
