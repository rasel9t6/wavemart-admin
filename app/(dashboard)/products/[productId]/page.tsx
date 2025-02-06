import ProductForm from '@/components/products/ProductForm';

export default async function ProductPage({
  params,
}: {
  params: { productId: string };
}) {
  const res = await fetch(` 
    ${process.env.NEXT_PUBLIC_E_COMMERCE_ADMIN_URL}/api/products/${params.productId}`);
  const productDetails = await res.json();
  return (
    <>
      <ProductForm initialData={productDetails} />
    </>
  );
}
