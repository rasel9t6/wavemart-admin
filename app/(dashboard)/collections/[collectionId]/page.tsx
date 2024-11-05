import CollectionForm from '@/components/collections/CollectionForm';
import Loader from '@/components/custom-ui/Loader';
import { Suspense } from 'react';

export default async function CollectionDetailsPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const id = (await params).collectionId;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_E_COMMERCE_ADMIN_URL}/api/collections/${id}`,
    { method: 'GET' }
  );
  if (!res.ok) {
    throw new Error('Failed to fetch collection');
  }
  const collection = await res.json();
  return (
    <Suspense fallback={<Loader />}>
      <CollectionForm initialData={collection} />
    </Suspense>
  );
}
