import { z } from 'zod';

export const productFormSchema = z.object({
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

export type ProductFormValues = z.infer<typeof productFormSchema>;
