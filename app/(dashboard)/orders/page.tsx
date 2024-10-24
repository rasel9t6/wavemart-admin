'use client';

import { useEffect, useState, useCallback } from 'react';
import DataTable from '@/components/custom-ui/DataTable';
import Loader from '@/components/custom-ui/Loader';
import { columns } from '@/components/orders/OrderColumns';
import { Separator } from '@/components/ui/separator';

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  // Define the getOrders function using useCallback to avoid unnecessary re-creation
  const getOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) {
        throw new Error(`Error fetching orders: ${res.statusText}`);
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('[orders_GET]', err);
    } finally {
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  if (loading) return <Loader />;

  return (
    <div className="px-10 py-5">
      <p className="text-heading2-bold">Orders</p>
      <Separator className="my-5 bg-gray-1" />
      <DataTable columns={columns} data={orders} searchKey="_id" />
    </div>
  );
}
