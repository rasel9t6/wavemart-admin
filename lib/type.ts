import { z } from 'zod';

export const productFormSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(2).max(2000).trim(),
  media: z.array(z.string().url({ message: 'Invalid media URL' })),
  category: z.string().min(1, 'Category is required'),
  collections: z.array(z.string()),
  tags: z.array(z.string()),
  sizes: z.array(z.string().toUpperCase()),
  colors: z.array(z.string().toLowerCase()),
  inputCurrency: z.enum(['CNY', 'USD']),
  minimumOrderQuantity: z
    .number()
    .min(1, 'Minimum order quantity must be at least 1'),
  quantityPricing: z.object({
    ranges: z.array(
      z.object({
        minQuantity: z.number().min(1, 'Min quantity must be at least 1'),
        maxQuantity: z.number().optional(),
        price: z.object({
          cny: z.number().min(0, 'Price cannot be negative'),
          usd: z.number().min(0, 'Price cannot be negative'),
          bdt: z.number().min(0, 'Price cannot be negative'),
        }),
      })
    ),
  }),
  price: z.object({
    cny: z.number().min(0, 'Price cannot be negative'),
    usd: z.number().min(0, 'Price cannot be negative'),
    bdt: z.number().min(0, 'Price cannot be negative'),
  }),
  expense: z.object({
    cny: z.number().min(0, 'Expense cannot be negative'),
    usd: z.number().min(0, 'Expense cannot be negative'),
    bdt: z.number().min(0, 'Expense cannot be negative'),
  }),
  currencyRates: z.object({
    usdToBdt: z.number().min(0, 'Rate cannot be negative'),
    cnyToBdt: z.number().min(0, 'Rate cannot be negative'),
  }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
