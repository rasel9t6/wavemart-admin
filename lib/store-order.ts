const STORE_API_URL = process.env.STORE_API_URL;
const STORE_API_KEY = process.env.STORE_API_KEY;

export async function updateStoreUserOrder(
  userId: string,
  orderId: string,
  orderData: any
) {
  console.log(
    `Updating order ${orderId} for user ${userId} in store system`,
    orderData
  );
  try {
    const response = await fetch(
      `${STORE_API_URL}/users/${userId}/orders/${orderId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${STORE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Unknown error' }));
      throw new Error(
        `Store API returned ${response.status}: ${JSON.stringify(errorData)}`
      );
    }

    console.log(`Updated order ${orderId} in store system for user ${userId}`);
    return true;
  } catch (apiError) {
    console.error(
      '[store_order_update]',
      apiError instanceof Error ? apiError.message : String(apiError)
    );
    return false;
  }
}
