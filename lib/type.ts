import { z } from 'zod';

const CurrencySchema = z.object({
  cny: z.number().min(0, 'Price in CNY cannot be negative'),
  usd: z.number().min(0, 'Price in USD cannot be negative'),
  bdt: z.number().min(0, 'Price in BDT cannot be negative'),
});

const RangeSchema = z.object({
  minQuantity: z.number().min(1, 'Minimum quantity must be at least 1'),
  maxQuantity: z
    .number()
    .optional()
    .refine(
      (val) => !val || val > 0,
      'Maximum quantity must be greater than 0'
    ),
  price: CurrencySchema,
});

export const productFormSchema = z.object({
  sku: z.string(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  slug: z.string().optional(),
  description: z
    .string()
    .max(2000, 'Description cannot exceed 2000 characters'),
  media: z.preprocess(
    (value) => {
      // If the value is a function (as returned by field.onChange), execute it to get the array
      if (typeof value === 'function') {
        try {
          const result = value([]);
          return Array.isArray(result) ? result : [];
        } catch {
          return [];
        }
      }
      // Otherwise, return the value directly if it's already an array
      return Array.isArray(value) ? value : [];
    },
    z
      .array(z.string().url('Please provide a valid URL for media'))
      .min(1, 'At least one media item is required')
  ),
  category: z.string().min(1, 'Category selection is required'),
  subcategories: z
    .array(z.string())
    .min(1, 'At least one subcategory must be selected')
    .optional(),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  sizes: z.array(z.string()).min(1, 'At least one size must be selected'),
  colors: z.preprocess(
    (value) => {
      // If the value is a function (as returned by field.onChange), execute it to get the array
      if (typeof value === 'function') {
        try {
          const result = value([]);
          return Array.isArray(result) ? result : [];
        } catch {
          return [];
        }
      }
      // Otherwise, return the value directly if it's already an array
      return Array.isArray(value) ? value : [];
    },
    z
      .array(z.string().url('Please provide a valid URL for media'))
      .min(1, 'At least one media item is required')
  ),
  minimumOrderQuantity: z
    .number()
    .min(1, 'Minimum order quantity must be at least 1'),
  inputCurrency: z.enum(['CNY', 'USD'], {
    errorMap: () => ({ message: 'Please select either CNY or USD' }),
  }),
  quantityPricing: z
    .object({
      ranges: z
        .array(RangeSchema)
        .min(1, 'At least one price range is required'),
    })
    .optional(),
  price: CurrencySchema,
  expense: CurrencySchema,
  currencyRates: z.object({
    usdToBdt: z.number().min(0, 'USD to BDT rate cannot be negative'),
    cnyToBdt: z.number().min(0, 'CNY to BDT rate cannot be negative'),
  }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
