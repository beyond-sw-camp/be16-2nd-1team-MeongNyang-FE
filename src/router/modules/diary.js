export default [
  {
    path: '/diarys',
    name: 'Diary',
    component: () => import('@/views/post/DiaryListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/diarys/create',
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
  },
  {
    path: '/diarys/:userId',
    name: 'UserDiary',
    component: () => import('@/views/post/UserDiaryListView.vue'),
    meta: { requiresAuth: true }
  }
]
