import ProductForm from '@/components/products/ProductForm';
import { ProductType } from '@/lib/types';
import { getProductDetails } from '@/server/product.actions';

export default async function ProductPage({
  params,
}: {
  params: { productId: string };
}) {
  const productDetails = (await getProductDetails(
    params.productId
  )) as ProductType;
  return (
    <>
      <ProductForm initialData={productDetails} />
    </>
  );
}
