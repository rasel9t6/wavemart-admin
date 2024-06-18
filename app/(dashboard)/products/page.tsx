import Link from 'next/link';

export default function ProductPage() {
  return (
    <div className="flex flex-col items-center gap-4">
      ProductPage
      <Link className="text-blue-1" href="/products/new">
        Create product
      </Link>
    </div>
  );
}
