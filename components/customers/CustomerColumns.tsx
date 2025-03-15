'use client';

import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

interface CustomerType {
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'blocked';
  customerType: 'regular' | 'wholesale' | 'vip';
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  createdAt: Date;
}

export const columns: ColumnDef<CustomerType>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'active'
              ? 'success'
              : status === 'inactive'
                ? 'warning'
                : 'destructive'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'customerType',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('customerType') as string;
      return (
        <Badge
          variant={
            type === 'vip'
              ? 'premium'
              : type === 'wholesale'
                ? 'business'
                : 'default'
          }
        >
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'totalOrders',
    header: 'Orders',
  },
  {
    accessorKey: 'totalSpent',
    header: 'Total Spent',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalSpent'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return formatted;
    },
  },
  {
    accessorKey: 'lastOrderDate',
    header: 'Last Order',
    cell: ({ row }) => {
      const date = row.getValue('lastOrderDate') as Date;
      if (!date) return '-';
      return format(new Date(date), 'MMM dd, yyyy');
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => {
      return format(new Date(row.getValue('createdAt')), 'MMM dd, yyyy');
    },
  },
];
