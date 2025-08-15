export default [
  {
    path: '/diary',
    name: 'Diary',
    component: () => import('@/views/post/DiaryListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/diary/new',
    name: 'DiaryCreate',
    component: () => import('@/views/post/DiaryCreateView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/diary/:id',
    name: 'DiaryDetail',
    component: () => import('@/views/post/DiaryDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/diary/:id/edit',
    name: 'DiaryEdit',
    component: () => import('@/views/post/DiaryEditView.vue'),
    meta: { requiresAuth: true }
  }
]
