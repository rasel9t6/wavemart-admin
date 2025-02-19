import { z } from 'zod';

const CurrencySchema = z.object({
  cny: z.number().min(0, 'Price cannot be negative'),
  usd: z.number().min(0, 'Price cannot be negative'),
  bdt: z.number().min(0, 'Price cannot be negative'),
});

const RangeSchema = z.object({
  minQuantity: z.number().min(1, 'Minimum quantity must be at least 1'),
  maxQuantity: z.number().optional(),
  price: CurrencySchema,
});

export const productFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  description: z.string().max(2000).optional(),
  media: z.array(z.string().url('Invalid URL')),
  category: z.string().min(1, 'Category is required'),
  subcategories: z.array(z.string()),
  tags: z.array(z.string()),
  sizes: z.array(z.string()),
  colors: z.array(z.string()),
  minimumOrderQuantity: z.number().min(1),
  inputCurrency: z.enum(['CNY', 'USD']),
  quantityPricing: z.object({
    ranges: z.array(RangeSchema),
  }),
  price: CurrencySchema,
  expense: CurrencySchema,
  currencyRates: z.object({
    usdToBdt: z.number().min(0),
    cnyToBdt: z.number().min(0),
  }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
