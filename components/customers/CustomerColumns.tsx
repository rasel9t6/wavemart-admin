'use client';

import { CustomerType } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<CustomerType>[] = [
  {
    accessorKey: 'customerId',
    header: 'Customer ID',
  },
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
    accessorKey: 'address',
    header: 'Address',
    cell: ({ row }) => {
      const address = row.original.address;
      return address ? (
        <div>
          <div>{address.street}</div>
          <div>
            {address.city}, {address.state} {address.postalCode}
          </div>
          <div>{address.country}</div>
        </div>
      ) : (
        <span className="text-gray-500">No address provided</span>
      );
    },
  },
  {
    accessorKey: 'orders',
    header: 'Orders',
    cell: ({ row }) => {
      const orders = row.original.orders; // orders is an array of order IDs
      return orders && orders.length > 0 ? (
        <div>
          <span className="font-bold">{orders.length}</span> orders
        </div>
      ) : (
        <span className="text-gray-500">No orders</span>
      );
    },
  },
];
