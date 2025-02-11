'use client';

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
import React from 'react';
import Delete from '../custom-ui/Delete';
import MultiText from '../custom-ui/MultiText';
import MultiSelect from '../custom-ui/MultiSelect';
import { ProductType } from '@/lib/types';
import { useProductForm } from '@/hooks/useProductForm';

interface ProductFormProps {
  initialData?: ProductType | null | undefined;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();

  const { form, loading, collections, onSubmit, handleKeyPress } =
    useProductForm(initialData || undefined);
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
