import DataTable from '@/components/custom-ui/DataTable';
import { columns } from '@/components/customers/CustomerColumns';

import { Separator } from '@radix-ui/react-separator';
export default async function CustomerPage() {
  const res = await fetch('/api/customers');
  const customers = await res.json();

  return (
    <div className="px-10 py-5">
      <p className="text-heading2-bold">Customers</p>
      <Separator className="my-5 bg-gray-1" />
      <DataTable columns={columns} data={customers} searchKey="name" />
    </div>
  );
}
export const dynamic = 'force-dynamic';
