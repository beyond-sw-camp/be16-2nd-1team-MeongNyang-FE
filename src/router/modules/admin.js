export default [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/AdminDashboardView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]
