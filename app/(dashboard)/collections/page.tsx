import { Plus } from 'lucide-react';

import DataTable from '@/components/custom-ui/DataTable';
import { columns } from '@/components/collections/CollectionColumns';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default async function CollectionPage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_E_COMMERCE_ADMIN_URL}/api/collections`
  );
  if (!res.ok) {
    throw new Error('Collections not found');
  }
  const collections = await res.json();

  return (
    <div className="p-1">
      <div className="flex items-center justify-between">
        <p className="text-heading2-bold">Collections</p>
        <Link
          className="flex items-center rounded-lg bg-blue-1 p-3 text-body-semibold text-white"
          href="/collections/new"
        >
          <Plus />
          Create Collection
        </Link>
      </div>
      <Separator className="my-4 bg-gray-1" />
      <DataTable columns={columns} data={collections} searchKey="title" />
    </div>
  );
}
