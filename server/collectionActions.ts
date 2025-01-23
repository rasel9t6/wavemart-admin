'use server';

export async function getProductDetails(productId: string) {
  try {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'GET',
    });
    const data = await res.json();
    console.log(data);
    return data;
  } catch (err) {
    console.log('[productId_GET]', err);
  }
}
