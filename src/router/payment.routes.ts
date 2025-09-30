import PaymentStatusView from '@/views/payment/PaymentStatusView.vue'

export const paymentRoutes = [
  {
    path: '/payment/success',
    name: 'payment.success',
    component: PaymentStatusView
  },
  {
    path: '/payment/fail',
    name: 'payment.fail',
    component: PaymentStatusView
  }
]
