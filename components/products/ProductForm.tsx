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
import React from 'react';
import Delete from '../custom-ui/Delete';
import MultiText from '../custom-ui/MultiText';
import MultiSelect from '../custom-ui/MultiSelect';
import { ProductType } from '@/lib/types';
import { useProductForm } from '@/hooks/useProductForm';
import MediaUpload from '../custom-ui/MediaUpload';

interface ProductFormProps {
  initialData?: ProductType | null | undefined;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const { form, loading, categories, onSubmit, handleKeyPress } =
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
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU(ID)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Product ID"
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
                  <MediaUpload
                    value={(field.value || []).map((url) => ({
                      url,
                      type: 'image',
                    }))}
                    onChange={(url) => {
                      const updatedImages = [...(field.value || []), url];
                      field.onChange(updatedImages);
                    }}
                    onRemove={(url) => {
                      const updatedImages = (field.value || []).filter(
                        (image) => image !== url
                      );
                      field.onChange(updatedImages);
                    }}
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
                      placeholder="USD to BDT Rate"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(
                          value === '' ? undefined : parseFloat(value)
                        );
                      }}
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
              name="price.usd"
              render={({ field }) => (
                <FormItem
                  className={
                    form.getValues('inputCurrency') === 'USD' ? '' : 'hidden'
                  }
                >
                  <FormLabel>Price (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Price in USD"
                      step="0.01"
                      min="0"
                      defaultValue={initialData?.price?.usd ?? 0}
                      {...field}
                      onChange={(e) => {
                        const value =
                          e.target.value === ''
                            ? undefined
                            : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      onKeyDown={handleKeyPress}
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price.cny"
              render={({ field }) => (
                <FormItem
                  className={
                    form.getValues('inputCurrency') === 'CNY' ? '' : 'hidden'
                  }
                >
                  <FormLabel>Price (CNY)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Price in CNY"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => {
                        const value =
                          e.target.value === ''
                            ? undefined
                            : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      onKeyDown={handleKeyPress}
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={
                form.getValues('inputCurrency') === 'USD'
                  ? 'expense.usd'
                  : 'expense.cny'
              }
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Expense ({form.getValues('inputCurrency')})
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={`Expense in ${form.getValues(
                        'inputCurrency'
                      )}`}
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
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
                className="grid grid-cols-5 gap-4 rounded border p-4"
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
                          min={form.watch(
                            `quantityPricing.ranges.${index}.minQuantity`
                          )}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
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
                  name={`quantityPricing.ranges.${index}.price`}
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
                          value={
                            field.value[
                              form.getValues('inputCurrency').toLowerCase() as
                                | 'cny'
                                | 'usd'
                                | 'bdt'
                            ]
                          }
                          onChange={(e) => {
                            const inputCurrency = form
                              .getValues('inputCurrency')
                              .toLowerCase();
                            field.onChange({
                              ...field.value,
                              [inputCurrency]: parseFloat(e.target.value),
                            });
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>BDT Price</FormLabel>
                  <Input
                    type="number"
                    value={form.getValues(
                      `quantityPricing.ranges.${index}.price.bdt`
                    )}
                    disabled
                    className="bg-gray-100"
                  />
                </FormItem>
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
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('subcategories', []); // Reset subcategories
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.slug} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />

            {/* Remove subcategories field */}
            {/* If you need to display subcategories, you can directly access them based on selected category */}
            {form.watch('category') && (
              <FormField
                control={form.control}
                name="subcategories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategories</FormLabel>
                    <FormControl>
                      <MultiSelect
                        placeholder="Select subcategories"
                        categories={
                          categories.find(
                            (c) => c.slug === form.watch('category')
                          )?.subcategories || []
                        }
                        value={Array.isArray(field.value) ? field.value : []} // Ensure it's always an array
                        onChange={(slug) =>
                          field.onChange([
                            ...(Array.isArray(field.value) ? field.value : []),
                            slug,
                          ])
                        }
                        onRemove={(idToRemove) =>
                          field.onChange(
                            (Array.isArray(field.value)
                              ? field.value
                              : []
                            ).filter(
                              (subcategoryId: string) =>
                                subcategoryId !== idToRemove
                            )
                          )
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
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <MultiText
                      placeholder="Add tags"
                      value={field.value}
                      onChange={(tag) =>
                        field.onChange([...field.value, tag.toLowerCase()])
                      }
                      onRemove={(tagToRemove) =>
                        field.onChange(
                          field.value.filter((tag) => tag !== tagToRemove)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <MediaUpload
                      value={(field.value || []).map((url) => ({
                        url,
                        type: 'image',
                      }))}
                      onChange={(url) => {
                        const updatedImages = [...(field.value || []), url];
                        field.onChange(updatedImages);
                      }}
                      onRemove={(url) => {
                        const updatedImages = (field.value || []).filter(
                          (image) => image !== url
                        );
                        field.onChange(updatedImages);
                      }}
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
                          ...(field.value ?? []).filter(
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
              {loading
                ? 'Saving...'
                : initialData
                  ? 'Update Product'
                  : 'Create Product'}
            </Button>
            <Button
              type="button"
              onClick={() => router.push('/products')}
              className="bg-gray-1 text-white"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
