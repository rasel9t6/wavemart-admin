import { FaPlus } from 'react-icons/fa6';
import DataTable from '@/components/custom-ui/DataTable';
import { columns } from '@/components/products/ProductColumns';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default async function ProductPage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_E_COMMERCE_ADMIN_URL}/api/products`
  );
  if (!res.ok) throw new Error('Failed to fetch products');

  const { products } = await res.json();
  console.log('admin', products);
  return (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between">
        <p className="text-heading2-bold">Products</p>
        <Link
          href="/products/new"
          className="flex items-center justify-center rounded-lg bg-blue-1 p-3 text-body-semibold text-white"
        >
          <FaPlus className="mr-2 size-4" />
          Create Product
        </Link>
      </div>
      <Separator className="my-4 bg-gray-1" />
      <DataTable columns={columns} data={products} searchKey="title" />
    </div>
  );
}
