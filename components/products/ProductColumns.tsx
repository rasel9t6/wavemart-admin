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
    cell: ({ row }) =>
      row.original.collections
        .map((collection: any) => collection.title)
        .join(', '),
  },
  {
    accessorKey: 'price.cny',
    header: 'Price (¥)',
  },
  {
    accessorKey: 'expense.cny',
    header: 'Expense (¥)',
  },
  {
    header: 'Action',
    id: 'actions',
    cell: ({ row }) => <Delete item="product" id={row.original._id} />,
  },
];
