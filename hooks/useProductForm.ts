'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CollectionType, ProductType } from '@/lib/types';
import { ProductFormValues, productFormSchema } from '@/lib/type';
import slugify from 'slugify';

const getDefaultValues = (initialData?: ProductType): ProductFormValues => ({
  sku: initialData?.sku || '',
  title: initialData?.title || '',
  slug: initialData?.slug || '', // Keep slug unchanged on edit
  description: initialData?.description || '',
  media: initialData?.media || [],
  category: initialData?.category?.name || initialData?.category || '',
  subcategories: initialData?.subcategories || [],
  tags: initialData?.tags || [],
  sizes: initialData?.sizes || [],
  colors: initialData?.colors || [],
  inputCurrency: initialData?.inputCurrency || 'CNY',
  minimumOrderQuantity: initialData?.minimumOrderQuantity || 1,
  quantityPricing: {
    ranges: initialData?.quantityPricing?.ranges || [],
  },
  price: {
    cny: initialData?.price?.cny ?? 0,
    usd: initialData?.price?.usd ?? 0,
    bdt: initialData?.price?.bdt ?? 0,
  },
  expense: {
    cny: initialData?.expense?.cny ?? 0,
    usd: initialData?.expense?.usd ?? 0,
    bdt: initialData?.expense?.bdt ?? 0,
  },
  currencyRates: {
    usdToBdt: initialData?.currencyRates?.usdToBdt ?? 121.5,
    cnyToBdt: initialData?.currencyRates?.cnyToBdt ?? 17.5,
  },
});

export const useProductForm = (initialData?: ProductType) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCollections] = useState<CollectionType[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: getDefaultValues(initialData),
  });

  const { watch, setValue } = form;
  const title = watch('title');

  useEffect(() => {
    if (!initialData) {
      setValue('slug', slugify(title, { lower: true, strict: true }));
    }
  }, [title, setValue, initialData]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCollections(data);
      } catch (err) {
        console.error('[collections_GET]', err);
        toast.error('Failed to load collections');
      }
    };

    // Fetch categories only if they haven't been loaded yet
    if (categories.length === 0) {
      fetchCollections();
    }
  }, [categories.length]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setLoading(true);
      const cleanedValues = JSON.parse(
        JSON.stringify(values, (key, value) =>
          value === undefined ? null : value
        )
      );

      const url = initialData
        ? `/api/products/${initialData._id}`
        : '/api/products';
      const method = initialData ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedValues),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || 'Failed to save product');
      }

      toast.success(
        `Product ${initialData ? 'updated' : 'created'} successfully`
      );
      router.push('/products');
      router.refresh();
    } catch (err) {
      console.error('[PRODUCT_SUBMIT]', err);
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    categories,
    onSubmit,
    handleKeyPress: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') e.preventDefault();
    },
  };
};
