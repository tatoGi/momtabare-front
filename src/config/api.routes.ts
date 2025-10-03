// API Route configuration
const API_ROUTES = {
  auth: {
    register: '/api/send-registration-email',
    verifyPhone: '/api/verify-phone',
    verifyEmail: '/api/verify-email',
    verifyCode: '/api/verify-email-code',
    resendPhoneCode: '/api/resend-phone-verification',
    resendEmailCode: '/api/resend-email-verification',
    completeRegistration: '/api/complete-registration',
    signIn: '/api/login',
    signOut: '/api/logout',
  },
  products: {
    list: '/products',
    detail: (id: string | number) => `/products/${id}`,
    search: '/products/search',
  },
  categories: {
    list: '/categories',
    detail: (id: string | number) => `/categories/${id}`,
  },
  pages: {
    getPage: (slug: string) => `/pages/${slug}`,
  },
  // Add more route groups as needed
} as const;

type ApiRoutes = typeof API_ROUTES;

export { API_ROUTES };
export type { ApiRoutes };
