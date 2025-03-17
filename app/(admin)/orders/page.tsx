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
    return [];
  }
}

export default async function OrdersPage() {
  const orders = await getOrders();

  // Calculate summary statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o: any) => o.status === 'pending'
  ).length;
  const processingOrders = orders.filter((o: any) =>
    ['confirmed', 'processing'].includes(o.status)
  ).length;
  const deliveredOrders = orders.filter(
    (o: any) => o.status === 'delivered'
  ).length;
  const totalRevenue = orders.reduce(
    (acc: number, curr: any) => acc + curr.totalAmount,
    0
  );
  const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Processing Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Delivered Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(averageOrderValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <DataTable
        columns={columns}
        data={orders}
        searchKey="orderId"
        searchPlaceholder="Search orders..."
      />
    </div>
  );
}

export const dynamic = 'force-dynamic';
