'use client';

import { useEffect, useState, useCallback } from 'react';
import DataTable from '@/components/custom-ui/DataTable';
import Loader from '@/components/custom-ui/Loader';
import { columns } from '@/components/customers/CustomerColumns';
import { Separator } from '@radix-ui/react-separator';

export default function CustomerPage() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);

  // Define getCustomers using useCallback for better performance
  const getCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/customers');
      if (!res.ok) {
        throw new Error(`Error fetching customers: ${res.statusText}`);
      }
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error('[customers_GET]', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCustomers();
  }, [getCustomers]);

  if (loading) return <Loader />;

  return (
    <div className="px-10 py-5">
      <p className="text-heading2-bold">Customers</p>
      <Separator className="my-5 bg-gray-1" />
      <DataTable columns={columns} data={customers} searchKey="name" />
    </div>
  );
}
