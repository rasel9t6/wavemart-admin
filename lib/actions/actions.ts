import Customer from '@/models/Customer';
import Order from '@/models/Order';
import { connectToDB } from '../mongoDB';
export const getTotalSales = async () => {
  try {
    await connectToDB();
    const orders = await Order.find();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (acc, order) => acc + (order.totalAmount || 0),
      0
    );
    return { totalOrders, totalRevenue };
  } catch (error) {
    console.error('Error fetching total sales:', error);
    throw new Error('Could not retrieve total sales');
  }
};

export const getTotalCustomers = async () => {
  try {
    await connectToDB();
    const customers = await Customer.find();
    const totalCustomers = customers.length;
    return totalCustomers;
  } catch (error) {
    console.error('Error fetching total customers:', error);
    throw new Error('Could not retrieve total customers');
  }
};

export const getSalesPerMonth = async () => {
  try {
    await connectToDB();
    const orders = await Order.find();

    const salesPerMonth = orders.reduce((acc, order) => {
      const monthIndex = new Date(order.createdAt).getMonth(); // 0 for January --> 11 for December
      acc[monthIndex] = (acc[monthIndex] || 0) + (order.totalAmount || 0); // Ensure it's a number
      return acc;
    }, {});

    const graphData = Array.from({ length: 12 }, (_, i) => {
      const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
        new Date(0, i)
      );
      return { name: month, sales: salesPerMonth[i] || 0 };
    });

    return graphData;
  } catch (error) {
    console.error('Error fetching sales per month:', error);
    throw new Error('Could not retrieve sales per month');
  }
};

export async function getCurrencyRate() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_URL}`);
  const currencyRate = await res.json();
  return currencyRate?.conversion_rates?.BDT || 17.5;
}
