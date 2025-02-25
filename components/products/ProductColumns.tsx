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
    accessorKey: 'category.name',
    header: 'Category',
    cell: ({ row }) => {
      const category = typeof row.original.category === 'object' ? row.original.category?.name : row.original.category || 'N/A';
      const subcategories =
        row.original.subcategories?.map((sub: any) => sub.name).join(', ') ||
        'N/A';

      return (
        <div>
          <p>
            <strong>Category:</strong> {category}
          </p>
          <p>
            <strong>Subcategories:</strong> {subcategories}
          </p>
        </div>
      );
    },
  },
  {
    header: 'Price',
    cell: ({ row }) => {
      const product = row.original;
      if (product.price?.cny !== undefined)
        return `¥ ${product.price.cny.toFixed(2)}`;
      if (product.price?.usd !== undefined)
        return `$ ${product.price.usd.toFixed(2)}`;
      return 'N/A';
    },
  },
  {
    header: 'Expense',
    cell: ({ row }) => {
      const product = row.original;
      if (product.expense?.cny !== undefined)
        return `¥ ${product.expense.cny.toFixed(2)}`;
      if (product.expense?.usd !== undefined)
        return `$ ${product.expense.usd.toFixed(2)}`;
      return 'N/A';
    },
  },
  {
    header: 'Action',
    id: 'actions',
    cell: ({ row }) => <Delete item="product" id={row.original._id} />,
  },
];
