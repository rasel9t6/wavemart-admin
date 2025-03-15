import DataTable from '@/components/custom-ui/DataTable';
import { columns } from '@/components/customers/CustomerColumns';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

async function getCustomers() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_ADMIN_URL}/api/customers`,
      {
        cache: 'no-store', // Ensures fresh data on every request
      }
    );

    if (!res.ok) {
      throw new Error(`Error fetching customers: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('[customers_GET]', error);
    return [];
  }
}

export default async function CustomerPage() {
  const customers = await getCustomers();
  console.log(customers);
  // Calculate summary statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (c: any) => c.status === 'active'
  ).length;
  const vipCustomers = customers.filter(
    (c: any) => c.customerType === 'vip'
  ).length;
  const totalRevenue = customers.reduce(
    (acc: number, curr: any) => acc + curr.totalSpent,
    0
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button>
          <Plus className="mr-2 size-4" />
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vipCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('bn-BD', {
                style: 'currency',
                currency: 'BDT',
              }).format(totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <DataTable
        columns={columns}
        data={customers}
        searchKey="name"
        searchPlaceholder="Search customers..."
      />
    </div>
  );
}
