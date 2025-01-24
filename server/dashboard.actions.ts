import Customer from '@/lib/models/Customer';
import Order from '@/lib/models/Order';
import { connectToDB } from '@/lib/mongoDB';

const connectAndFetchData = async (model: any, errorMessage: string) => {
  try {
    await connectToDB();
    return await model.find();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw new Error(errorMessage);
  }
};

export const getTotalSales = async () => {
  const errorMessage = 'Could not retrieve total sales';
  const orders = await connectAndFetchData(Order, errorMessage);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (acc: number, order: any) => acc + (order.totalAmount || 0),
    0
  );

  return { totalOrders, totalRevenue };
};

export const getTotalCustomers = async () => {
  const errorMessage = 'Could not retrieve total customers';
  const customers = await connectAndFetchData(Customer, errorMessage);
  return customers.length;
};

export const getSalesPerMonth = async () => {
  const errorMessage = 'Could not retrieve sales per month';
  const orders = await connectAndFetchData(Order, errorMessage);

  const salesPerMonth = orders.reduce(
    (acc: Record<number, number>, order: any) => {
      const monthIndex = new Date(order.createdAt).getMonth(); // 0 for January --> 11 for December
      acc[monthIndex] = (acc[monthIndex] || 0) + (order.totalAmount || 0);
      return acc;
    },
    {}
  );

  const graphData = Array.from({ length: 12 }, (_, i) => ({
    name: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
      new Date(0, i)
    ),
    sales: salesPerMonth[i] || 0,
  }));

  return graphData;
};
