export type ProductType = {
  _id: string;
  sku: string;
  title: string;
  slug: string;
  description?: string;
  media: string[];
  category: any;
  subcategories: string[];
  tags: string[];
  sizes: string[];
  colors: string[];
  minimumOrderQuantity: number;
  inputCurrency: 'CNY' | 'USD';
  quantityPricing: {
    ranges: {
      minQuantity: number;
      maxQuantity?: number;
      price: {
        cny: number;
        usd: number;
        bdt: number;
      };
    }[];
  };
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
};

export type CollectionType = {
  _id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  thumbnail: string;
  subcategories: string[];
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
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  orders: string[];
  createdAt: string;
  updatedAt: string;
};
