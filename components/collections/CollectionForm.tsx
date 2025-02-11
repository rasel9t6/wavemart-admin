'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ImageUpload from '../custom-ui/ImageUpload';
import Delete from '../custom-ui/Delete';

// Types
type Subcategory = {
  name: string;
  title: string;
  description: string;
  icon: string | null;
  thumbnail: string | null;
  isActive: boolean;
};

interface CategoryFormProps {
  initialData?: {
    _id: string;
    name: string;
    title: string;
    description: string;
    icon: string | null;
    thumbnail: string | null;
    isActive: boolean;
    sortOrder: number;
    subcategories: Subcategory[];
  } | null;
}

// Schema
const subcategorySchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must not exceed 50 characters'),
  title: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(500, 'Name must not exceed 50 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters')
    .trim(),
  icon: z.string().min(1, 'Icon is required').nullable(),
  thumbnail: z.string().min(1, 'Thumbnail is required').nullable(),
  isActive: z.boolean().default(true),
});

const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  title: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(500, 'Name must not exceed 50 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1500, 'Description must not exceed 1000 characters')
    .trim(),
  icon: z.string().min(1, 'Icon is required').nullable(),
  thumbnail: z.string().min(1, 'Thumbnail is required').nullable(),
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
    defaultValues: initialData || {
      name: '',
      title: '',
      description: '',
      icon: null,
      thumbnail: null,
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
        `Category ${initialData ? 'updated' : 'created'} successfully`
      );
      router.push('/collections');
      router.refresh();
    } catch (error) {
      toast.error('Failed to save category. Please try again.');
      console.error('Category submission error:', error);
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

  const getNestedError = (
    errors: FieldErrors<FormValues>,
    path: string
  ): string | undefined => {
    const parts = path.split('.');
    let current: any = errors;

    for (const part of parts) {
      if (current?.[part]) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current?.message;
  };

  const renderField = (
    name:
      | keyof FormValues
      | `subcategories.${number}.name`
      | `subcategories.${number}.title`
      | `subcategories.${number}.description`
      | `subcategories.${number}.icon`
      | `subcategories.${number}.thumbnail`
      | `subcategories.${number}.isActive`,
    label: string,
    type: 'text' | 'textarea' | 'number' = 'text',
    placeholder: string = ''
  ) => {
    const error = getNestedError(form.formState.errors, name);

    return (
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
        {type === 'textarea' ? (
          <textarea
            {...form.register(
              name as
                | keyof FormValues
                | `subcategories.${number}.${keyof Subcategory}`
            )}
            placeholder={placeholder}
            onKeyDown={handleKeyPress}
            className="min-h-[120px] w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <input
            type={type}
            {...form.register(
              name,
              type === 'number' ? { valueAsNumber: true } : undefined
            )}
            placeholder={placeholder}
            onKeyDown={handleKeyPress}
            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  const renderToggle = (name: string, label: string) => (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="checkbox"
        {...form.register(
          name as
            | keyof FormValues
            | `subcategories.${number}.${keyof Subcategory}`
        )}
        className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    </div>
  );

  const renderImageUpload = (name: string, label: string) => {
    const error = getNestedError(form.formState.errors, name);
    const value = form.watch(
      name as keyof FormValues | `subcategories.${number}.${keyof Subcategory}`
    );

    return (
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4">
          <ImageUpload
            value={typeof value === 'string' ? [value] : []}
            onChange={(url: string) =>
              form.setValue(
                name as
                  | keyof FormValues
                  | `subcategories.${number}.${keyof Subcategory}`,
                url,
                {
                  shouldValidate: true,
                  shouldDirty: true,
                }
              )
            }
            onRemove={() =>
              form.setValue(
                name as
                  | keyof FormValues
                  | `subcategories.${number}.${keyof Subcategory}`,
                '',
                {
                  shouldValidate: true,
                  shouldDirty: true,
                }
              )
            }
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
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
            {initialData && <Delete id={initialData._id} item="category" />}
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
            {renderField(
              'name',
              'Name',
              'text',
              'Enter category short name...'
            )}
            {renderField('title', 'Title', 'text', 'Enter category title...')}
            {renderField(
              'description',
              'Description',
              'textarea',
              'Describe your category...'
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {renderImageUpload('icon', 'Icon')}
              {renderImageUpload('thumbnail', 'Thumbnail')}
            </div>

            {renderField(
              'sortOrder',
              'Sort Order',
              'number',
              'Enter sort order...'
            )}
            {renderToggle('isActive', 'Active Status')}

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
                    {renderField(
                      `subcategories.${index}.name`,
                      'Name',
                      'text',
                      'Enter subcategory name...'
                    )}
                    {renderField(
                      `subcategories.${index}.title`,
                      'Title',
                      'text',
                      'Enter category title...'
                    )}
                    {renderField(
                      `subcategories.${index}.description`,
                      'Description',
                      'textarea',
                      'Describe your subcategory...'
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {renderImageUpload(`subcategories.${index}.icon`, 'Icon')}
                      {renderImageUpload(
                        `subcategories.${index}.thumbnail`,
                        'Thumbnail'
                      )}
                    </div>

                    {renderToggle(
                      `subcategories.${index}.isActive`,
                      'Active Status'
                    )}
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
