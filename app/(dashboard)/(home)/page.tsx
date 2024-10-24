import SalesChart from '@/components/custom-ui/SalesChart';
import SectionSeparator from '@/components/custom-ui/SectionSeparator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getSalesPerMonth,
  getTotalCustomers,
  getTotalSales,
} from '@/lib/actions/actions';

import { CircleDollarSign, ShoppingBag, UserRound } from 'lucide-react';

export default async function HomePage() {
  const totalRevenue = await getTotalSales().then((data) => data.totalRevenue);
  const totalOrders = await getTotalSales().then((data) => data.totalOrders);
  const totalCustomers = await getTotalCustomers();

  const graphData = await getSalesPerMonth();
  return (
    <div className="px-8 py-10">
      <p className="text-heading2-bold">Dashboard</p>
      <SectionSeparator />

      <div className="mt-10 grid grid-cols-2 gap-10 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Total Revenue</CardTitle>
            <CircleDollarSign className="max-sm:hidden" />
          </CardHeader>
          <CardContent>
            <p className="text-body-bold">$ {totalRevenue}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Total Orders</CardTitle>
            <ShoppingBag className="max-sm:hidden" />
          </CardHeader>
          <CardContent>
            <p className="text-body-bold">{totalOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Total Customer</CardTitle>
            <UserRound className="max-sm:hidden" />
          </CardHeader>
          <CardContent>
            <p className="text-body-bold">{totalCustomers}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Sales Chart ($)</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesChart data={graphData} />
        </CardContent>
      </Card>
    </div>
  );
}
