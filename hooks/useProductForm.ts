'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CollectionType, ProductType } from '@/lib/types';
import { ProductFormValues, productFormSchema } from '@/lib/type';

const getDefaultValues = (initialData?: ProductType): ProductFormValues => {
  if (initialData) {
    return {
      ...initialData,
      collections: initialData.collections.map((collection) => collection._id),
      price: {
        cny: initialData.price.cny,
        usd: initialData.price.usd,
        bdt: initialData.price.bdt,
      },
      expense: {
        cny: initialData.expense.cny,
        usd: initialData.expense.usd,
        bdt: initialData.expense.bdt,
      },
      currencyRates: {
        usdToBdt: initialData.currencyRates.usdToBdt,
        cnyToBdt: initialData.currencyRates.cnyToBdt,
      },
      quantityPricing: {
        ranges: initialData.quantityPricing.map((range) => ({
          minQuantity: range.minQuantity,
          maxQuantity: range.maxQuantity,
          price: {
            cny: range.price.cny,
            usd: range.price.usd,
            bdt: range.price.bdt,
          },
        })),
      },
    };
  }
  return {
    title: '',
    description: '',
    media: [],
    category: '',
    collections: [],
    tags: [],
    sizes: [],
    colors: [],
    inputCurrency: 'CNY',
    minimumOrderQuantity: 1,
    quantityPricing: { ranges: [] },
    price: { cny: 0, usd: 0, bdt: 0 },
    expense: { cny: 0, usd: 0, bdt: 0 },
    currencyRates: { usdToBdt: 121.5, cnyToBdt: 17.5 },
  };
};

export const useProductForm = (initialData?: ProductType) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<CollectionType[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: getDefaultValues(initialData),
  });

  const { watch, setValue } = form;
  const cnySelling = watch('price.cny');
  const cnyExpense = watch('expense.cny');
  const currencyRate = watch('currencyRates.cnyToBdt');

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch('/api/collections');
        const data = await res.json();
        setCollections(data);
      } catch (err) {
        console.error('[collections_GET]', err);
        toast.error('Failed to load collections');
      }
    };
    fetchCollections();
  }, []);

  useEffect(() => {
    setValue('price.bdt', Number((cnySelling * currencyRate).toFixed(2)));
    setValue('expense.bdt', Number((cnyExpense * currencyRate).toFixed(2)));
  }, [cnySelling, cnyExpense, currencyRate, setValue]);

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
      await Promise.all([router.push('/products'), router.refresh()]);
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
