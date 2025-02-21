'use client';

import { ColumnDef } from '@tanstack/react-table';
import Delete from '../custom-ui/Delete';
import Link from 'next/link';
import { ProductType } from '@/lib/types';

export const columns: ColumnDef<ProductType>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <Link href={`/products/${row.original._id}`} className="hover:text-red-1">
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: 'categories',
    header: 'Categories',
    cell: ({ row }) => row.original.category,
  },
  {
    header: 'Price',
    cell: ({ row }) => {
      const product = row.original;

      // Check for CNY price first
      if (product.price?.cny !== undefined && product.price.cny !== null) {
        return `¥ ${product.price.cny.toFixed(2)}`;
      }

      // If no CNY price, check for USD price
      if (product.price?.usd !== undefined && product.price.usd !== null) {
        return `$ ${product.price.usd.toFixed(2)}`;
      }

      // If no price found
      return 'N/A';
    },
  },
  {
    header: 'Expense',
    cell: ({ row }) => {
      const product = row.original;

      // Check for CNY expense first
      if (product.expense?.cny !== undefined && product.expense.cny !== null) {
        return `¥ ${product.expense.cny.toFixed(2)}`;
      }

      // If no CNY expense, check for USD expense
      if (product.expense?.usd !== undefined && product.expense.usd !== null) {
        return `$ ${product.expense.usd.toFixed(2)}`;
      }

      // If no expense found
      return 'N/A';
    },
  },
  {
    header: 'Action',
    id: 'actions',
    cell: ({ row }) => <Delete item="product" id={row.original._id} />,
  },
];
