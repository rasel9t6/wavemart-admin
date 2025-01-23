import Loader from '@/components/custom-ui/Loader';
import ProductForm from '@/components/products/ProductForm';
import { ProductType } from '@/lib/types';
import { getProductDetails } from '@/server/productActions';

import { Suspense } from 'react';

export default async function ProductPage({
  params,
}: {
  params: { productId: string };
}) {
  const productDetails = (await getProductDetails(
    params.productId
  )) as ProductType;
  console.log('Product Details:', productDetails);
  return (
    <>
      <Suspense fallback={<Loader />}>
        <ProductForm initialData={productDetails} />
      </Suspense>
    </>
  );
}
