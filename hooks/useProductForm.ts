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
        bdt: initialData.price.bdt,
        currencyRate: initialData.price.currencyRate,
      },
      expense: {
        cny: initialData.expense.cny,
        bdt: initialData.expense.bdt,
        currencyRate: initialData.expense.currencyRate,
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
  const currencyRate = watch('price.currencyRate');

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
    const bdtPrice = Number((cnySelling * currencyRate).toFixed(2));
    const bdtExpense = Number((cnyExpense * currencyRate).toFixed(2));
    setValue('price.bdt', bdtPrice);
    setValue('expense.bdt', bdtExpense);
  }, [cnySelling, cnyExpense, currencyRate, setValue]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setLoading(true);
      const url = initialData
        ? `/api/products/${initialData._id}`
        : '/api/products';
      const method = initialData ? 'POST' : 'POST';

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
