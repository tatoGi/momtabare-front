// Mock user data
const mockUsers = [
  {
    id: 1,
    first_name: 'Demo',
    last_name: 'User',
    email: 'demo@example.com',
    country_code: 'US',
    phone_number: '1234567890',
    profile_picture: '',
    rating_stats: {
      average: 4.5,
      total: 10,
      rating_1: 0,
      rating_2: 0,
      rating_3: 1,
      rating_4: 3,
      rating_5: 6
    },
    products_amount: 5,
    comments_amount: 3,
    is_retailer: 1,
    is_admin: 1,
    created_at: new Date().toISOString()
  }
];

export async function getUser() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return { ...mockUsers[0] }; // Return a copy of the first user
}

export async function getUserById(userId: number) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    throw new Error('User not found');
  }
  return { ...user }; // Return a copy of the user
}

export async function getAllUsers() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    users: mockUsers.map(user => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      profile_picture: user.profile_picture,
      rating_stats: user.rating_stats,
      products_amount: user.products_amount,
      comments_amount: user.comments_amount,
      is_retailer: user.is_retailer,
      is_admin: user.is_admin,
      created_at: user.created_at
    }))
  };
}
