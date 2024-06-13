'use client';

import CollectionForm from '@/components/collections/CollectionForm';
import Loader from '@/components/custom-ui/Loader';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function CollectionDetailsPage({
  params,
}: {
  params: { collectionId: string };
}) {
  const [loading, setLoading] = useState(true);
  const [collectionDetails, setCollectionDetails] =
    useState<CollectionType | null>(null);
  async function getCollectionDetails() {
    try {
      const res = await fetch(`/api/collections/${params.collectionId}`, {
        method: 'GET',
      });
      const data = await res.json();
      setCollectionDetails(data);
      setLoading(false);
    } catch (error) {
      console.log('[collection_Get]', error);
      toast.error('Something went wrong!');
    }
  }
  useEffect(() => {
    getCollectionDetails();
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <CollectionForm initialData={collectionDetails} />
  );
}
