'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

import DataTable from '@/components/custom-ui/DataTable';
import { columns } from './CollectionColumns';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function CollectionPage() {
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const router = useRouter();

  async function getCollections() {
    try {
      const res = await fetch('/api/collections', { method: 'GET' });
      const data = await res.json();
      setCollections(data);
      setLoading(false);
    } catch (error) {
      console.log('[collections_GET]', error);
    }
  }
  useEffect(() => {
    getCollections();
  }, []);

  return (
    <div className="p-1">
      <div className="flex items-center justify-between">
        <p className="text-heading2-bold">Collections</p>
        <Button
          className="bg-blue-1 text-white"
          onClick={() => router.push('/collections/new')}
        >
          <Plus />
          Create Collection
        </Button>
      </div>
      <Separator className="my-4 bg-gray-1" />
      <DataTable columns={columns} data={collections} searchKey="title" />
    </div>
  );
}
