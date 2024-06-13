'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Trash } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function Delete({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  // const router = useRouter();
  async function onDelete() {
    try {
      setLoading(true);

      const res = await fetch(`/api/collections/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setLoading(false);
        toast.success('Collection deleted');
        // router.push('/collections');
        // window.location.href = '/collections';
      } else {
        // Handle non-OK responses appropriately
        console.error('Collection deletion failed:', await res.text());
        toast.error('Collection deletion failed. Please try again.');
      }
    } catch (error) {
      console.error('[collection_DELETE]', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button className="bg-red-1 text-white">
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white text-gray-1">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-1">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            collection.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-red-1 text-white" onClick={onDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
