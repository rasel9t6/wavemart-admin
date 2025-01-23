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
import { FaTrash } from 'react-icons/fa6';

export default function Delete({ id, item }: { id: string; item: string }) {
  const [loading, setLoading] = useState(false);
  async function onDelete() {
    try {
      setLoading(true);
      const itemType = item === 'product' ? 'products' : 'collections';
      const res = await fetch(`/api/${itemType}/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setLoading(false);
        toast.success(`${item} deleted`);
      } else {
        console.error(`${item} deletion failed`, await res.text());
        toast.error(`${item} deletion failed.Please try again.`);
      }
    } catch (error) {
      console.error(`[${item}]_DELETE`, error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button className="bg-red-1 text-white">
          <FaTrash className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white text-gray-1">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-1">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {`This action cannot be undone. This will permanently delete your
            ${item}.`}
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
