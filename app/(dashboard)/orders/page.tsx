import DataTable from '@/components/custom-ui/DataTable';
import { columns } from '@/components/orders/OrderColumns';
import { Separator } from '@/components/ui/separator';

export default async function OrdersPage() {
  let orders = [];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_E_COMMERCE_ADMIN_URL}/orders`,
      {
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      throw new Error(
        `Error fetching orders: ${res.status} - ${res.statusText}`
      );
    }

    orders = await res.json();
  } catch (error) {
    console.error('[orders_GET]', error);
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
