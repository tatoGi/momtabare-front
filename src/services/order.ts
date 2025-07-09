import { IGetOrdersResponse } from "../ts/services/order.types.ts"
import AxiosJSON from "../utils/helpers/axios.ts"

export async function checkout() {
  return { success: true, orderId: 123 };
}

export async function getOrders() {
  return {
    orders: [
      { id: 1, total: 100, status: 'completed' },
      { id: 2, total: 200, status: 'pending' }
    ]
  };
}
