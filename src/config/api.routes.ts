// API Route configuration
const API_ROUTES = {
  auth: {
    register: '/send-registration-email',
    verifyPhone: '/verify-phone',
    verifyEmail: '/verify-email',
    verifyCode: '/verify-email-code',
    resendPhoneCode: '/resend-phone-verification',
    resendEmailCode: '/resend-email-verification',
    completeRegistration: '/complete-registration',
    signIn: '/login',
    signOut: '/logout',
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
