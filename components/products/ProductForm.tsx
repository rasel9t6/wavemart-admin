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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  // Helper function to add a new quantity price range
  const addQuantityRange = () => {
    const currentRanges = form.getValues('quantityPricing.ranges') || [];
    form.setValue('quantityPricing.ranges', [
      ...currentRanges,
      {
        minQuantity: 1,
        maxQuantity: undefined,
        price: {
          cny: 0,
          usd: 0,
          bdt: 0,
        },
      },
    ]);
  };

  // Helper function to remove a quantity range
  const removeQuantityRange = (index: number) => {
    const currentRanges = form.getValues('quantityPricing.ranges');
    form.setValue(
      'quantityPricing.ranges',
      currentRanges.filter((_, idx) => idx !== index)
    );
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
              name="inputCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Input Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select input currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CNY">CNY</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minimumOrderQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Order Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Minimum order quantity"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      onKeyDown={handleKeyPress}
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currencyRates.usdToBdt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>USD to BDT Rate</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="USD to CNY Rate"
                      step="0.01"
                      min="0"
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
              name="currencyRates.cnyToBdt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNY to BDT Rate</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="CNY to BDT Rate"
                      step="0.01"
                      min="0"
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
              name={`price.${form.getValues('inputCurrency').toLowerCase()}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Price ({form.getValues('inputCurrency')})
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={`Price in ${form.getValues('inputCurrency')}`}
                      step="0.01"
                      min="0"
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
              name={`expense.${form.getValues('inputCurrency').toLowerCase()}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Expense ({form.getValues('inputCurrency')})
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={`Expense in ${form.getValues('inputCurrency')}`}
                      step="0.01"
                      min="0"
                      {...field}
                      onKeyDown={handleKeyPress}
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Quantity-based Pricing</FormLabel>
              <Button
                type="button"
                onClick={addQuantityRange}
                className="bg-blue-1 text-white"
              >
                Add Range
              </Button>
            </div>

            {form.watch('quantityPricing.ranges')?.map((range, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-4 rounded border p-4"
              >
                <FormField
                  control={form.control}
                  name={`quantityPricing.ranges.${index}.minQuantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`quantityPricing.ranges.${index}.maxQuantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={
                            form.watch(
                              `quantityPricing.ranges.${index}.minQuantity`
                            ) + 1
                          }
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseInt(e.target.value) : null
                            )
                          }
                          placeholder="Leave empty for unlimited"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`quantityPricing.ranges.${index}.price.${form.getValues('inputCurrency').toLowerCase()}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Price ({form.getValues('inputCurrency')})
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  onClick={() => removeQuantityRange(index)}
                  className="self-end bg-red-1 text-white"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="gap-8 md:grid md:grid-cols-3">
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
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
