'use client';
import DataTable from '@/components/custom-ui/DataTable';
import Loader from '@/components/custom-ui/Loader';
import { columns } from '@/components/products/ProductColumns';
import { Button } from '@/components/ui/button';
import { Separator } from '@radix-ui/react-separator';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProductPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductType[]>([]);
  const router = useRouter();
  const getProducts = async () => {
    try {
      const res = await fetch('/api/products', { method: 'GET' });
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.log('[products_GET]', error);
    }
  };
  useEffect(() => {
    getProducts();
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
          <Plus className="mr-2 h-4 w-4" />
          Create Product
        </Button>
      </div>
      <Separator className="my-4 bg-gray-1" />
      <DataTable columns={columns} data={products} searchKey="title" />
    </div>
  );
}
