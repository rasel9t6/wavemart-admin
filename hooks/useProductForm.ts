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
  title: initialData?.title || '',
  slug: initialData?.slug || '',
  description: initialData?.description || '',
  media: initialData?.media || [],
  category: initialData?.category || '',
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
    cny: initialData?.price?.cny || 0,
    usd: initialData?.price?.usd || 0,
    bdt: initialData?.price?.bdt || 0,
  },
  expense: {
    cny: initialData?.expense?.cny || 0,
    usd: initialData?.expense?.usd || 0,
    bdt: initialData?.expense?.bdt || 0,
  },
  currencyRates: {
    usdToBdt: initialData?.currencyRates?.usdToBdt || 121.5,
    cnyToBdt: initialData?.currencyRates?.cnyToBdt || 17.5,
  },
});

export const useProductForm = (initialData?: ProductType) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<CollectionType[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: getDefaultValues(initialData),
  });

  const { watch, setValue } = form;

  // Watch for currency calculations
  // const inputCurrency = watch('inputCurrency');
  // const price = watch(`price.${inputCurrency.toLowerCase()}`);
  // const expense = watch(`expense.${inputCurrency.toLowerCase()}`);
  // const currencyRate = watch(
  //   `currencyRates.${inputCurrency.toLowerCase()}ToBdt`
  // );

  // Watch title for slug generation
  const title = watch('title');

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCollections(data);
      } catch (err) {
        console.error('[collections_GET]', err);
        toast.error('Failed to load collections');
      }
    };
    fetchCollections();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      setValue('slug', slugify(title, { lower: true, strict: true }));
    }
  }, [title, setValue]);

  // Calculate BDT prices
  // useEffect(() => {
  //   if (price && currencyRate) {
  //     setValue('price.bdt', Number((price * currencyRate).toFixed(2)));
  //   }
  //   if (expense && currencyRate) {
  //     setValue('expense.bdt', Number((expense * currencyRate).toFixed(2)));
  //   }
  // }, [price, expense, currencyRate, setValue]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setLoading(true);
      const url = initialData
        ? `/api/products/${initialData._id}`
        : '/api/products';
      const method = initialData ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save product');
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
    collections,
    onSubmit,
    handleKeyPress: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') e.preventDefault();
    },
  };
};
