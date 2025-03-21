import DataTable from '@/components/custom-ui/DataTable';
import { columns } from '@/components/categories/CategoryColumns';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa6';

export default async function CategoriesPage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_ADMIN_URL}/api/categories`
  );
  const categories = await res.json();
  return (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between">
        <p className="text-heading2-bold">Categories</p>
        <Link
          className="flex items-center rounded-lg bg-blue-1 p-3 text-body-semibold text-white"
          href="/categories/new"
        >
          <FaPlus className="mr-2 size-4" />
          Create Categories
        </Link>
      </div>
      <Separator className="my-4 bg-gray-1" />
      <DataTable columns={columns} data={categories || []} searchKey="title" />
    </div>
  );
}
