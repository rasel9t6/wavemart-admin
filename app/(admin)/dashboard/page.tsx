import SalesChart from '@/components/custom-ui/SalesChart';
import SectionSeparator from '@/components/custom-ui/SectionSeparator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getSalesPerMonth,
  getTotalCustomers,
  getTotalSales,
} from '@/lib/actions/actions';
import { TbCoinTakaFilled } from 'react-icons/tb';
import { HiShoppingBag } from 'react-icons/hi2';
import { FaUserGroup } from 'react-icons/fa6';
import React from 'react';

// Define card data structure
const DASHBOARD_CARDS = [
  {
    title: 'Total Revenue',
    icon: TbCoinTakaFilled,
    getValue: (data: any) => `৳ ${data.totalRevenue}`,
  },
  {
    title: 'Total Orders',
    icon: HiShoppingBag,
    getValue: (data: any) => data.totalOrders,
  },
  {
    title: 'Total Customers',
    icon: FaUserGroup,
    getValue: (data: any) => data.totalCustomers,
  },
];

// Separate error component
const DashboardError = () => (
  <div className="px-8 py-10">
    <p className="text-heading2-bold">Dashboard</p>
    <SectionSeparator />
    <p className="text-red-600">
      Failed to load dashboard data. Please try again later.
    </p>
  </div>
);

// Separate card component
const DashboardCard = ({
  title,
  value,
  Icon,
}: {
  title: string;
  value: string | number;
  Icon: React.ElementType;
}) => (
  <Card className="bg-white">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>{title}</CardTitle>
      <Icon className="size-7 max-sm:hidden" />
    </CardHeader>
    <CardContent>
      <p className="text-body-bold">{value}</p>
    </CardContent>
  </Card>
);

export default async function HomePage() {
  try {
    // Fetch all required data in parallel
    const [salesData, totalCustomers, graphData] = await Promise.all([
      getTotalSales(),
      getTotalCustomers(),
      getSalesPerMonth(),
    ]);

    const combinedData = {
      ...salesData,
      totalCustomers,
    };

    return (
      <div className="px-8 py-10">
        <p className="text-heading2-bold">Dashboard</p>
        <SectionSeparator />

        <div className="mt-10 grid grid-cols-2 gap-10 md:grid-cols-3">
          {DASHBOARD_CARDS.map((card) => (
            <DashboardCard
              key={card.title}
              title={card.title}
              value={card.getValue(combinedData)}
              Icon={card.icon}
            />
          ))}
        </div>

        <Card className="mt-10 bg-white">
          <CardHeader>
            <CardTitle>Sales Chart (৳)</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={graphData} />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return <DashboardError />;
  }
}
