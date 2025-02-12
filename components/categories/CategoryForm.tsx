'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ImageUpload from '../custom-ui/ImageUpload';
import Delete from '../custom-ui/Delete';

// Types matching MongoDB Schema
type Subcategory = {
  name: string;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  isActive: boolean;
};

interface CategoryFormProps {
  initialData?: {
    slug: string;
    name: string;
    title: string;
    description?: string;
    icon: string;
    thumbnail: string;
    isActive: boolean;
    sortOrder: number;
    subcategories: Subcategory[];
  } | null;
}

// Schemas matching MongoDB requirements
const subcategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  thumbnail: z.string().optional(),
  isActive: z.boolean().default(true),
});

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  icon: z.string().min(1, 'Icon is required'),
  thumbnail: z.string().min(1, 'Thumbnail is required'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  subcategories: z.array(subcategorySchema).default([]),
});

type FormValues = z.infer<typeof formSchema>;

const CategoryForm = ({ initialData }: CategoryFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? { ...initialData, subcategories: initialData.subcategories || [] }
      : {
          name: '',
          title: '',
          description: '',
          icon: '',
          thumbnail: '',
          isActive: true,
          sortOrder: 0,
          subcategories: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subcategories',
  });

  const handleFormSubmit = async (values: FormValues) => {
    console.log('Submitting Data:', values);
    try {
      setIsSubmitting(true);
      const url = initialData
        ? `/api/categories/${initialData.slug}`
        : '/api/categories';

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast.success(
        `Category ${initialData ? 'updated' : 'created'} successfully`
      );
      router.push('/categories');
      router.refresh();
    } catch (error) {
      toast.error('Failed to save category. Please try again.');
      console.error('Category submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm md:p-10">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {initialData ? 'Edit Category' : 'Create Category'}
            </h1>
            {initialData && <Delete id={initialData.slug} item="category" />}
          </div>
          <hr className="my-4 border-gray-200" />
        </div>

        {/* Form */}
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          <div className="space-y-6">
            {/* Main Category Fields */}
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                {...form.register('name')}
                placeholder="Enter category name..."
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {form.formState.errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                {...form.register('title')}
                placeholder="Enter category title..."
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {form.formState.errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...form.register('description')}
                placeholder="Describe your category..."
                className="min-h-[120px] w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Icon
                </label>
                <ImageUpload
                  value={form.watch('icon') ? [form.watch('icon')] : []}
                  onChange={(url) => form.setValue('icon', url)}
                  onRemove={() => form.setValue('icon', '')}
                />
                {form.formState.errors.icon && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.icon.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Thumbnail
                </label>
                <ImageUpload
                  value={
                    form.watch('thumbnail') ? [form.watch('thumbnail')] : []
                  }
                  onChange={(url) => form.setValue('thumbnail', url)}
                  onRemove={() => form.setValue('thumbnail', '')}
                />
                {form.formState.errors.thumbnail && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.thumbnail.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Sort Order
              </label>
              <input
                type="number"
                {...form.register('sortOrder', { valueAsNumber: true })}
                placeholder="Enter sort order..."
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <label className="text-sm font-medium text-gray-700">
                Active Status
              </label>
              <input
                type="checkbox"
                {...form.register('isActive')}
                className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Subcategories Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Subcategories</h2>
                <button
                  type="button"
                  onClick={() =>
                    append({
                      name: '',
                      title: '',
                      description: '',
                      icon: '',
                      thumbnail: '',
                      isActive: true,
                    })
                  }
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Add Subcategory
                </button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border p-4">
                  <div className="mb-4 flex justify-between">
                    <h3 className="text-lg font-medium">
                      Subcategory {index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="mb-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        {...form.register(`subcategories.${index}.name`)}
                        placeholder="Enter subcategory name..."
                        className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <input
                        {...form.register(`subcategories.${index}.title`)}
                        placeholder="Enter subcategory title..."
                        className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        {...form.register(`subcategories.${index}.description`)}
                        placeholder="Describe your subcategory..."
                        className="min-h-[120px] w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Icon
                        </label>
                        <ImageUpload
                          value={
                            form.watch(`subcategories.${index}.icon`)
                              ? [
                                  form.watch(`subcategories.${index}.icon`),
                                ].filter((x): x is string => !!x)
                              : []
                          }
                          onChange={(url) =>
                            form.setValue(`subcategories.${index}.icon`, url)
                          }
                          onRemove={() =>
                            form.setValue(`subcategories.${index}.icon`, '')
                          }
                        />
                      </div>

                      <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Thumbnail
                        </label>
                        <ImageUpload
                          value={
                            form.watch(`subcategories.${index}.thumbnail`)
                              ? [
                                  form.watch(
                                    `subcategories.${index}.thumbnail`
                                  ),
                                ].filter((x): x is string => !!x)
                              : []
                          }
                          onChange={(url) =>
                            form.setValue(
                              `subcategories.${index}.thumbnail`,
                              url
                            )
                          }
                          onRemove={() =>
                            form.setValue(
                              `subcategories.${index}.thumbnail`,
                              ''
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <label className="text-sm font-medium text-gray-700">
                        Active Status
                      </label>
                      <input
                        type="checkbox"
                        {...form.register(`subcategories.${index}.isActive`)}
                        className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving...'
                : `Save ${initialData ? 'Changes' : 'Category'}`}
            </button>
            <Link href="/categories">
              <button
                type="button"
                className="rounded-md border border-gray-300 px-6 py-2 hover:bg-gray-50"
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
