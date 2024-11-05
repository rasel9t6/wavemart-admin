"use client";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Separator } from '../ui/separator';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '../ui/textarea';
import ImageUpload from '../custom-ui/ImageUpload';
import { redirect } from 'next/navigation';
import React from 'react';
import toast from 'react-hot-toast';
import Delete from '../custom-ui/Delete';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

const formSchema = z.object({
  title: z.string().min(3).max(50),
  description: z.string().min(10).max(1000).trim(),
  image: z.string(),
});

export default function CollectionForm({
  initialData,
}: {
  initialData?: {
    _id: string;
    title: string;
    description: string;
    image: string;
  } | null;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
  
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      image: '',
    },
  });
  

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const url = initialData
      ? `/api/collections/${initialData._id}`
      : '/api/collections';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (response.ok) {
      toast.success(`Collection ${initialData ? 'updated' : 'created'}`);
      redirect('/collections');
    } else {
      toast.success('Something went wrong! Please try again');
      console.error('Collection creation failed');
    }
  }
  const handleKeyPress = (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };
  return (
    <div className="p-10">
      {initialData ? (
        <div className="flex items-center justify-between">
          <p className="text-heading2-bold">Edit Collection</p>
          <Delete id={initialData._id} item="collection" />
        </div>
      ) : (
        <p className="text-heading2-bold">Create Collection</p>
      )}
      <Separator className="mb-7 mt-4 bg-gray-1" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Write your product title..."
                    {...field}
                    onKeyDown={handleKeyPress}
                  />
                </FormControl>
                <FormMessage className="text-red-1" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your product description..."
                    {...field}
                    rows={5}
                    onKeyDown={handleKeyPress}
                  />
                </FormControl>
                <FormMessage className="text-red-1" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange('')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-10">
            <Button type="submit" className="bg-blue-1 text-white">
              Submit
            </Button>
            <Link
              href="/collections"
              type="button"
              className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-blue-1 px-4 py-2 text-base-medium font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              Discard
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
