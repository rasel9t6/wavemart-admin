export type ProductType = {
  _id: string;
  title: string;
  description: string;
  media: string[];
  category: string;
  collections: { _id: string }[];
  tags: string[];
  sizes: string[];
  colors: string[];
  minimumOrderQuantity: number;
  inputCurrency: 'CNY' | 'USD';
  quantityPricing: {
    minQuantity: number;
    maxQuantity?: number;
    price: {
      cny: number;
      usd: number;
      bdt: number;
    };
  }[];
  price: {
    cny: number;
    usd: number;
    bdt: number;
  };
  expense: {
    cny: number;
    usd: number;
    bdt: number;
  };
  currencyRates: {
    usdToBdt: number;
    cnyToBdt: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type CollectionType = {
  _id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  thumbnail: string;
  products: ProductType[];
};

export type OrderColumnType = {
  _id: string;
  customer: string;
  products: number;
  totalAmount: number;
  createdAt: string;
};

export type OrderItemType = {
  product: ProductType;
  color: string;
  size: string;
  quantity: number;
};

export type CustomerType = {
  clerkId: string;
  name: string;
  email: string;
};
