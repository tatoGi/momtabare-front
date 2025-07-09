// Mock data for development

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

export async function toggleFavoriteProduct(productId: number): Promise<{ success: boolean }> {
  console.log('Toggling favorite for product:', productId);
  // In a real implementation, this would make an API call
  return { success: true };
}