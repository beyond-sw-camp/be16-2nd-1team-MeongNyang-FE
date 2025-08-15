export default [
  {
    path: '/market',
    name: 'Market',
    component: () => import('@/views/market/MarketListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/market/new',
    name: 'MarketCreate',
    component: () => import('@/views/market/MarketCreateView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/market/:id',
    name: 'MarketDetail',
    component: () => import('@/views/market/MarketDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/market/:id/edit',
    name: 'MarketEdit',
    component: () => import('@/views/market/MarketEditView.vue'),
    meta: { requiresAuth: true }
  }
]
