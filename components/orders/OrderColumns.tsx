'use client';
import { OrderColumnType } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';

export const columns: ColumnDef<OrderColumnType>[] = [
  {
    accessorKey: '_id',
    header: 'Order',
    cell: ({ row }) => (
      <Link href={`/orders/${row.original._id}`} className="hover:text-blue-1">
        {row.original._id}
      </Link>
    ),
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
  },
  {
    accessorKey: 'products',
    header: 'Products',
    cell: ({ row }) => {
      const products = row.original.products;
      const totalItems = products.reduce((sum: number, p: any) => sum + p.quantity, 0);
      return `${totalItems} items`;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'delivered'
              ? 'outline'
              : status === 'canceled'
                ? 'destructive'
                : status === 'pending'
                  ? 'secondary'
                  : 'default'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'paymentStatus',
    header: 'Payment',
    cell: ({ row }) => {
      const status = row.getValue('paymentStatus') as string;
      return (
        <Badge
          variant={
            status === 'paid'
              ? 'outline'
              : status === 'failed'
                ? 'destructive'
                : 'secondary'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalAmount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return formatted;
    },
  },
  {
    accessorKey: 'shippingMethod',
    header: 'Shipping',
    cell: ({ row }) => {
      const method = row.getValue('shippingMethod') as string;
      const delivery = row.getValue('deliveryType') as string;
      return (
        <div className="flex flex-col">
          <span className="capitalize">{method}</span>
          <span className="text-xs capitalize text-muted-foreground">
            {delivery}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      return format(new Date(row.getValue('createdAt')), 'MMM dd, yyyy');
    },
  },
];
