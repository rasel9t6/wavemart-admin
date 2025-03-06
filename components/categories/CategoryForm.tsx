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
  shippingCharge: {
    byAir: { min: number; max: number };
    bySea: { min: number; max: number };
  };
  name: string;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  isActive: boolean;
  sortOrder: number;
  parentId: string;
};
interface CategoryFormProps {
  initialData?: {
    shippingCharge: {
      byAir: { min: number; max: number };
      bySea: { min: number; max: number };
    };
    _id: string;
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
  sortOrder: z.number().int().default(0),
  parentId: z.string().optional(),
  shippingCharge: z
    .object({
      byAir: z.object({
        min: z
          .number()
          .min(0, 'Min shipping charge must be positive')
          .default(0),
        max: z
          .number()
          .min(0, 'Max shipping charge must be positive')
          .default(0),
      }),
      bySea: z.object({
        min: z
          .number()
          .min(0, 'Min shipping charge must be positive')
          .default(0),
        max: z
          .number()
          .min(0, 'Max shipping charge must be positive')
          .default(0),
      }),
    })
    .default({
      byAir: { min: 0, max: 0 },
      bySea: { min: 0, max: 0 },
    }),
});

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().min(1, 'Icon is required'),
  thumbnail: z.string().min(1, 'Thumbnail is required'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  shippingCharge: z
    .object({
      byAir: z.object({
        min: z
          .number()
          .min(0, 'Min shipping charge must be positive')
          .default(0),
        max: z
          .number()
          .min(0, 'Max shipping charge must be positive')
          .default(0),
      }),
      bySea: z.object({
        min: z
          .number()
          .min(0, 'Min shipping charge must be positive')
          .default(0),
        max: z
          .number()
          .min(0, 'Max shipping charge must be positive')
          .default(0),
      }),
    })
    .default({
      byAir: { min: 0, max: 0 },
      bySea: { min: 0, max: 0 },
    }),
  subcategories: z.array(subcategorySchema).default([]),
});

type FormValues = z.infer<typeof formSchema>;

const CategoryForm = ({ initialData }: CategoryFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [isSubcategoryVisible, setIsSubcategoryVisible] = useState(
    (initialData?.subcategories?.length ?? 0) > 0
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          shippingCharge: initialData.shippingCharge || {
            byAir: { min: 0, max: 0 },
            bySea: { min: 0, max: 0 },
          },
          subcategories:
            initialData.subcategories.map((sub) => ({
              ...sub,
              parentId: initialData._id,
              shippingCharge: sub.shippingCharge || {
                byAir: { min: 0, max: 0 },
                bySea: { min: 0, max: 0 },
              },
            })) || [],
        }
      : {
          name: '',
          title: '',
          description: '',
          icon: '',
          thumbnail: '',
          isActive: true,
          sortOrder: 0,
          shippingCharge: {
            byAir: { min: 0, max: 0 },
            bySea: { min: 0, max: 0 },
          },
          subcategories: [],
        },
    mode: 'onChange',
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'subcategories',
  });
  if (fields.length === 0 && initialData?.subcategories?.length) {
    replace(
      initialData.subcategories.map((sub) => ({
        ...sub,
        parentId: initialData._id,
        shippingCharge: sub.shippingCharge || {
          byAir: { min: 0, max: 0 },
          bySea: { min: 0, max: 0 },
        },
      }))
    );
  }
  const handleFormSubmit = async (values: FormValues) => {
    console.log(values);
    try {
      setIsSubmitting(true);

      // Format the data for the API
      const formattedData = {
        ...values,
        subcategories: values.subcategories.map((sub, index) => ({
          ...sub,
          sortOrder: index,
          parentId: initialData?._id || '', // Will be set by API for new categories
        })),
      };

      const url = initialData
        ? `/api/categories/${initialData.slug}`
        : '/api/categories';

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save category');
      }

      toast.success(
        `Category ${initialData ? 'updated' : 'created'} successfully`
      );
      router.push('/categories');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save category'
      );
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
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Shipping Charge (BDT)</h2>

              {/* By Air */}
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    By Air - Min
                  </label>
                  <input
                    type="number"
                    min={0}
                    {...form.register('shippingCharge.byAir.min', {
                      valueAsNumber: true,
                    })}
                    placeholder="Min charge for Air..."
                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {form.formState.errors.shippingCharge?.byAir?.min && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.shippingCharge.byAir.min.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    By Air - Max
                  </label>
                  <input
                    type="number"
                    min={0}
                    {...form.register('shippingCharge.byAir.max', {
                      valueAsNumber: true,
                    })}
                    placeholder="Max charge for Air..."
                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {form.formState.errors.shippingCharge?.byAir?.max && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.shippingCharge.byAir.max.message}
                    </p>
                  )}
                </div>
              </div>

              {/* By Sea */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    By Sea - Min
                  </label>
                  <input
                    type="number"
                    min={0}
                    {...form.register('shippingCharge.bySea.min', {
                      valueAsNumber: true,
                    })}
                    placeholder="Min charge for Sea..."
                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {form.formState.errors.shippingCharge?.bySea?.min && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.shippingCharge.bySea.min.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    By Sea - Max
                  </label>
                  <input
                    type="number"
                    min={0}
                    {...form.register('shippingCharge.bySea.max', {
                      valueAsNumber: true,
                    })}
                    placeholder="Max charge for Sea..."
                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {form.formState.errors.shippingCharge?.bySea?.max && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.shippingCharge.bySea.max.message}
                    </p>
                  )}
                </div>
              </div>
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
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setIsSubcategoryVisible(!isSubcategoryVisible)
                    }
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    {isSubcategoryVisible ? 'Hide' : 'Show'} Subcategories
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubcategoryVisible(true);
                      append({
                        name: '',
                        title: '',
                        description: '',
                        icon: '',
                        thumbnail: '',
                        isActive: true,
                        sortOrder: fields.length,
                        parentId: initialData?._id || '',
                        shippingCharge: {
                          byAir: { min: 0, max: 0 },
                          bySea: { min: 0, max: 0 },
                        },
                      });
                    }}
                    className="rounded-md border border-blue-300 bg-blue-100 px-4 py-2 text-sm text-blue-500 transition-colors duration-300 hover:bg-gray-50"
                  >
                    Add Subcategory
                  </button>
                </div>
              </div>

              {isSubcategoryVisible &&
                fields.map((field, index) => (
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
                          {...form.register(
                            `subcategories.${index}.description`
                          )}
                          placeholder="Describe your subcategory..."
                          className="min-h-[120px] w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Shipping Charge Section for Subcategory */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold">
                          Shipping Charge
                        </h3>

                        {/* By Air */}
                        <div className="mt-2 grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              By Air - Min
                            </label>
                            <input
                              type="number"
                              {...form.register(
                                `subcategories.${index}.shippingCharge.byAir.min`,
                                { valueAsNumber: true }
                              )}
                              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              By Air - Max
                            </label>
                            <input
                              type="number"
                              {...form.register(
                                `subcategories.${index}.shippingCharge.byAir.max`,
                                { valueAsNumber: true }
                              )}
                              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                            />
                          </div>
                        </div>

                        {/* By Sea */}
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              By Sea - Min
                            </label>
                            <input
                              type="number"
                              {...form.register(
                                `subcategories.${index}.shippingCharge.bySea.min`,
                                { valueAsNumber: true }
                              )}
                              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              By Sea - Max
                            </label>
                            <input
                              type="number"
                              {...form.register(
                                `subcategories.${index}.shippingCharge.bySea.max`,
                                { valueAsNumber: true }
                              )}
                              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                            />
                          </div>
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
