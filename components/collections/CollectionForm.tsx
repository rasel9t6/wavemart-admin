'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import ImageUpload from '../custom-ui/ImageUpload';
import Delete from '../custom-ui/Delete';

// Types
interface CollectionFormProps {
  initialData?: {
    _id: string;
    title: string;
    description: string;
    icon: string;
    thumbnail: string;
  } | null;
}

// Schema
const formSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(50, 'Title must not exceed 50 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters')
    .trim(),
  icon: z.string().min(1, 'Icon is required'),
  thumbnail: z.string().min(1, 'Thumbnail is required'),
});

type FormValues = z.infer<typeof formSchema>;

const CollectionForm = ({ initialData }: CollectionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      icon: '',
      thumbnail: '',
    },
  });

  const handleFormSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const url = initialData
        ? `/api/collections/${initialData._id}`
        : '/api/collections';

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast.success(
        `Collection ${initialData ? 'updated' : 'created'} successfully`
      );
      console.log(initialData);
      router.push('/collections');
      router.refresh();
    } catch (error) {
      toast.error('Failed to save collection. Please try again.');
      console.error('Collection submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    },
    []
  );

  const renderField = useCallback(
    (
      name: keyof FormValues,
      label: string,
      Component: typeof Input | typeof Textarea,
      props: Record<string, any> = {}
    ) => (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium text-gray-700">{label}</FormLabel>
            <FormControl>
              <Component
                {...field}
                {...props}
                onKeyDown={handleKeyPress}
                className={`${props.className || ''} bg-gray-50 transition-colors focus:bg-white`}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    [form.control, handleKeyPress]
  );

  const renderImageUpload = useCallback(
    (name: 'icon' | 'thumbnail', label: string) => (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium text-gray-700">{label}</FormLabel>
            <FormControl>
              <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4">
                <ImageUpload
                  value={field.value ? [field.value] : []}
                  onChange={(url) => field.onChange(url)}
                  onRemove={() => field.onChange('')}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    [form.control]
  );

  return (
    <Card className="p-6 md:p-10">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-heading2-bold">
              {initialData ? 'Edit Collection' : 'Create Collection'}
            </h1>
            {initialData && <Delete id={initialData._id} item="collection" />}
          </div>
          <Separator className="my-4 bg-gray-1" />
        </div>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            <div className="grid gap-6">
              {renderField('title', 'Title', Input, {
                placeholder: 'Enter collection title...',
                className: 'py-2 pl-3',
              })}

              {renderField('description', 'Description', Textarea, {
                placeholder: 'Describe your collection...',
                className: 'min-h-[120px]',
              })}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {renderImageUpload('icon', 'Icon')}
                {renderImageUpload('thumbnail', 'Thumbnail')}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 px-6 text-white hover:bg-blue-700"
              >
                {isSubmitting
                  ? 'Saving...'
                  : `Save ${initialData ? 'Changes' : 'Collection'}`}
              </Button>
              <Link href="/collections">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </Card>
  );
};

export default CollectionForm;
