'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus } from 'react-icons/fa6';
import DataTable from '@/components/custom-ui/DataTable';
import Loader from '@/components/custom-ui/Loader';
import { columns } from '@/components/products/ProductColumns';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function ProductPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductType[]>([]);
  const router = useRouter();

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products', { cache: 'no-store' });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) return <Loader />;

  return (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between">
        <p className="text-heading2-bold">Products</p>
        <Button
          className="bg-blue-1 text-white"
          onClick={() => router.push('/products/new')}
        >
          <FaPlus className="mr-2 size-4" />
          Create Product
        </Button>
      </div>
      <Separator className="my-4 bg-gray-1" />
      <DataTable columns={columns} data={products} searchKey="title" />
    </div>
  );
}
