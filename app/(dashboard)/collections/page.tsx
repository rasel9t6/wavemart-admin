'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

import DataTable from '@/components/custom-ui/DataTable';
import { columns } from '@/components/collections/CollectionColumns';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Loader from '@/components/custom-ui/Loader';

export default function CollectionPage() {
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const router = useRouter();

  // Fetch collections data
  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/collections');
      const data = await res.json();
      setCollections(data);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchCollections(); 
  }, []);

  if (loading) {
    return <Loader />;
  }

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
