export default [
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]
