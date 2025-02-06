'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
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
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Delete from '../custom-ui/Delete';
import MultiText from '../custom-ui/MultiText';
import MultiSelect from '../custom-ui/MultiSelect';
import { CollectionType, ProductType } from '@/lib/types';

// Updated form schema to match the model structure
const formSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(2).max(2000).trim(),
  media: z.array(z.string().url({ message: 'Invalid media URL' })),
  category: z.string().min(1, 'Category is required'),
  collections: z.array(z.string()),
  tags: z.array(z.string()),
  sizes: z.array(z.string()),
  colors: z.array(z.string()),
  price: z.object({
    cny: z.number().min(0, 'Price cannot be negative'),
    bdt: z.number().min(0, 'Price cannot be negative'),
    currencyRate: z.number(),
  }),
  expense: z.object({
    cny: z.number().min(0, 'Expense cannot be negative'),
    bdt: z.number().min(0, 'Expense cannot be negative'),
    currencyRate: z.number(),
  }),
});

interface ProductFormProps {
  initialData?: ProductType | null | undefined;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [collections, setCollections] = useState<CollectionType[]>([]);
  const [loading, setLoading] = useState(false);
  const getCollections = async () => {
    try {
      const res = await fetch('/api/collections', {
        method: 'GET',
      });
      const data = await res.json();
      setCollections(data);
    } catch (err) {
      console.log('[collections_GET]', err);
      toast.error('Something went wrong! Please try again.');
    }
  };

  useEffect(() => {
    getCollections();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          collections: initialData.collections.map(
            (collection) => collection._id
          ),
          price: {
            cny: initialData.price.cny,
            bdt: initialData.price.bdt,
            currencyRate: initialData.price.currencyRate,
          },
          expense: {
            cny: initialData.expense.cny,
            bdt: initialData.expense.bdt,
            currencyRate: initialData.expense.currencyRate,
          },
        }
      : {
          title: '',
          description: '',
          media: [],
          category: '',
          collections: [],
          tags: [],
          sizes: [],
          colors: [],
          price: {
            cny: 0,
            bdt: 0,
            currencyRate: 17.5,
          },
          expense: {
            cny: 0,
            bdt: 0,
            currencyRate: 17.5,
          },
        },
  });

  // Add a watch for CNY prices to auto-calculate BDT
  const cnySelling = form.watch('price.cny');
  const cnyExpense = form.watch('expense.cny');
  const currencyRate = form.watch('price.currencyRate');

  useEffect(() => {
    const bdtPrice = Number((cnySelling * currencyRate).toFixed(2));
    const bdtExpense = Number((cnyExpense * currencyRate).toFixed(2));
    form.setValue('price.bdt', bdtPrice);
    form.setValue('expense.bdt', bdtExpense);
  }, [cnySelling, cnyExpense, currencyRate, form]);

  const handleKeyPress = (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const url = initialData
        ? `/api/products/${initialData._id}`
        : '/api/products';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        let errorData;
        try {
          // Try to parse the response body if it's not empty
          errorData = await res.json();
        } catch (err) {
          // If there's an error in parsing, fallback to a generic message
          errorData = { message: 'Failed to save product' };
        }
        throw new Error(errorData.message || 'Failed to save product');
      }

      toast.success(
        `Product ${initialData ? 'updated' : 'created'} successfully`
      );
      router.push('/products');
      router.refresh();
    } catch (err) {
      console.error('[products_POST]', err);
      if (err instanceof Error) {
        toast.error(err.message || 'Something went wrong! Please try again.');
      } else {
        toast.error('Something went wrong! Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      {initialData ? (
        <div className="flex items-center justify-between">
          <p className="text-heading2-bold">Edit Product</p>
          <Delete id={initialData._id} item="product" />
        </div>
      ) : (
        <p className="text-heading2-bold">Create Product</p>
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
                    placeholder="Title"
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
                    placeholder="Description"
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
            name="media"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={(url) => field.onChange([...field.value, url])}
                    onRemove={(url) =>
                      field.onChange([
                        ...field.value.filter((image) => image !== url),
                      ])
                    }
                  />
                </FormControl>
                <FormMessage className="text-red-1" />
              </FormItem>
            )}
          />

          <div className="gap-8 md:grid md:grid-cols-3">
            <FormField
              control={form.control}
              name="price.currencyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency Rate (CNY to BDT)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Currency Rate"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(value);
                        form.setValue('expense.currencyRate', value);
                      }}
                      onKeyDown={handleKeyPress}
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />

            {/* CNY Price Field */}
            <FormField
              control={form.control}
              name="price.cny"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (CNY)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Price in CNY"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      onKeyDown={handleKeyPress}
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />

            {/* BDT Price Display */}
            <FormField
              control={form.control}
              name="price.bdt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (BDT) - Auto-calculated</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Price in BDT"
                      disabled
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />

            {/* CNY Expense Field */}
            <FormField
              control={form.control}
              name="expense.cny"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense (CNY)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Expense in CNY"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      onKeyDown={handleKeyPress}
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />

            {/* BDT Expense Display */}
            <FormField
              control={form.control}
              name="expense.bdt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense (BDT) - Auto-calculated</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Expense in BDT"
                      disabled
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Category"
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
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <MultiText
                      placeholder="Tags"
                      value={field.value}
                      onChange={(tag) =>
                        field.onChange([...field.value, tag.toLowerCase()])
                      }
                      onRemove={(tagToRemove) =>
                        field.onChange([
                          ...field.value.filter((tag) => tag !== tagToRemove),
                        ])
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />

            {collections.length > 0 && (
              <FormField
                control={form.control}
                name="collections"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collections</FormLabel>
                    <FormControl>
                      <MultiSelect
                        placeholder="Collections"
                        collections={collections}
                        value={field.value}
                        onChange={(_id) =>
                          field.onChange([...field.value, _id])
                        }
                        onRemove={(idToRemove) =>
                          field.onChange([
                            ...field.value.filter(
                              (collectionId) => collectionId !== idToRemove
                            ),
                          ])
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-red-1" />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="colors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colors</FormLabel>
                  <FormControl>
                    <MultiText
                      placeholder="Colors"
                      value={field.value}
                      onChange={(color) =>
                        field.onChange([...field.value, color.toLowerCase()])
                      }
                      onRemove={(colorToRemove) =>
                        field.onChange([
                          ...field.value.filter(
                            (color) => color !== colorToRemove
                          ),
                        ])
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sizes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sizes</FormLabel>
                  <FormControl>
                    <MultiText
                      placeholder="Sizes"
                      value={field.value}
                      onChange={(size) =>
                        field.onChange([...field.value, size.toUpperCase()])
                      }
                      onRemove={(sizeToRemove) =>
                        field.onChange([
                          ...field.value.filter(
                            (size) => size !== sizeToRemove
                          ),
                        ])
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-10">
            <Button
              type="submit"
              className="bg-blue-1 text-white"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Submit'}
            </Button>
            <Button
              type="button"
              onClick={() => router.push('/products')}
              className="bg-blue-1 text-white"
              disabled={loading}
            >
              Discard
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
