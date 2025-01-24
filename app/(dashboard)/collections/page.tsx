import DataTable from '@/components/custom-ui/DataTable';
import { columns } from '@/components/collections/CollectionColumns';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa6';

import { getCollections } from '@/server/collection.actions';

export default async function CollectionPage() {
  const collections = (await getCollections()) as any;

  return (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between">
        <p className="text-heading2-bold">Collections</p>
        <Link
          className="flex items-center rounded-lg bg-blue-1 p-3 text-body-semibold text-white"
          href="/collections/new"
        >
          <FaPlus className="mr-2 size-4" />
          Create Collection
        </Link>
      </div>
      <Separator className="my-4 bg-gray-1" />
      <DataTable columns={columns} data={collections || []} searchKey="title" />
    </div>
  );
}
