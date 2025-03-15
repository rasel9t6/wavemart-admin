import DataTable from '@/components/custom-ui/DataTable';
import { columns } from '@/components/orderItems/OrderItemsColumns';

export default async function OrderDetailsPage({
  params,
}: {
  params: { orderId: string };
}) {
  // Fetch order details
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_ADMIN_URL}/api/orders/${params.orderId}`,
    { cache: 'no-store' } // Ensure fresh data
  );
  console.log(res);
  if (!res.ok) {
    return (
      <div className="p-10">
        <p className="text-red-500">
          Failed to fetch order details. Please try again.
        </p>
      </div>
    );
  }

  const order = await res.json();

  if (!order) {
    return (
      <div className="p-10">
        <p className="text-red-500">Order not found.</p>
      </div>
    );
  }

  const {
    _id,
    totalAmount,
    shippingRate,
    shippingAddress,
    products,
    userId,
    status,
    paymentStatus,
  } = order;
  const { name, email, phone } = userId || {};
  const { street, city, state, postalCode, country } = shippingAddress || {};

  return (
    <div className="flex flex-col gap-5 p-10">
      <p className="text-base-bold">
        Order ID: <span className="text-base-medium">{_id}</span>
      </p>
      <p className="text-base-bold">
        Customer Name: <span className="text-base-medium">{name || 'N/A'}</span>
      </p>
      <p className="text-base-bold">
        Customer Email:{' '}
        <span className="text-base-medium">{email || 'N/A'}</span>
      </p>
      <p className="text-base-bold">
        Customer Phone:{' '}
        <span className="text-base-medium">{phone || 'N/A'}</span>
      </p>
      <p className="text-base-bold">
        Shipping Address:{' '}
        <span className="text-base-medium">
          {street}, {city}, {state}, {postalCode}, {country}
        </span>
      </p>
      <p className="text-base-bold">
        Total Paid:{' '}
        <span className="text-base-medium">
          {new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
          }).format(totalAmount)}
        </span>
      </p>
      <p className="text-base-bold">
        Shipping Rate ID:{' '}
        <span className="text-base-medium">{shippingRate}</span>
      </p>
      <p className="text-base-bold">
        Order Status: <span className="text-base-medium">{status}</span>
      </p>
      <p className="text-base-bold">
        Payment Status:{' '}
        <span className="text-base-medium">{paymentStatus}</span>
      </p>

      <DataTable
        columns={columns}
        data={products}
        searchKey="product"
        searchPlaceholder="Search by product name"
      />
    </div>
  );
}
