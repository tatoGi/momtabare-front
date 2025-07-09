import AxiosJSON from "../utils/helpers/axios.ts"
import {
  IGetProductByIdQuery,
  IGetProductByIdResponse,
  IGetProductsQuery,
  IGetProductsResponse,
} from "../ts/services/products.types"

export async function getProducts() {
  return {
    products: [
      { id: 1, name: 'Demo Product', price: 100 },
      { id: 2, name: 'Sample Product', price: 200 }
    ],
    total: 2
  };
}

export async function getProductBySku() {
  return { id: 1, name: 'Demo Product', price: 100 };
}

export async function getProductBySeller() {
  return {
    products: [
      { id: 1, name: 'Demo Product', price: 100 }
    ],
    total: 1
  };
}

export async function getFavoriteProducts() {
  return {
    products: [
      { id: 2, name: 'Sample Product', price: 200 }
    ],
    total: 1
  };
}

export async function toggleFavoriteProduct() {
  return { success: true };
}