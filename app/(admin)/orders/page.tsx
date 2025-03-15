import DataTable from '@/components/custom-ui/DataTable';
import { columns } from '@/components/orders/OrderColumns';
import { Separator } from '@/components/ui/separator';

export default async function OrdersPage() {
  let orders = [];

  try {
    if (!process.env.NEXT_PUBLIC_E_COMMERCE_ADMIN_URL) {
      throw new Error('E-commerce admin URL is not configured');
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_E_COMMERCE_ADMIN_URL}/api/orders`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Response error:', errorText);
      throw new Error(
        `Error fetching orders: ${res.status} - ${res.statusText}`
      );
    }

    const data = await res.json();
    orders = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[orders_GET]', error);
    // You might want to handle the error UI here
  }

  return (
    <div className="px-10 py-5">
      <p className="text-heading2-bold">Orders</p>
      <Separator className="my-5 bg-gray-1" />

      {orders.length === 0 ? (
        <p className="my-5 text-center text-gray-500">No orders found.</p>
      ) : (
        <DataTable columns={columns} data={orders} searchKey="_id" />
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';
