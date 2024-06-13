'use client';

import Delete from '@/components/custom-ui/Delete';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<CollectionType>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => <p>{row.original.title}</p>,
  },
  {
    accessorKey: 'products',
    header: 'Products',
    cell: ({ row }) => <p>{row.original.products.length}</p>,
  },
  {
    id: 'action',
    header: 'Action',
    cell: ({ row }) => <Delete />,
  },
];
