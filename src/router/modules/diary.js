export default [
  {
    path: '/diarys',
    name: 'MyDiary',
    component: () => import('@/views/diary/DiaryListView.vue'),
    props: {userId: null},
    meta: { requiresAuth: true },
  },
  {
    path: '/diarys/create',
    name: 'DiaryCreate',
    component: () => import('@/views/diary/DiaryCreateView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/diary/:id',
    name: 'DiaryDetail',
    component: () => import('@/views/diary/DiaryDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/diary/:id/edit',
    name: 'DiaryEdit',
    component: () => import('@/views/diary/DiaryEditView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/diarys/:userId',
    name: 'UserDiary',
    component: () => import('@/views/diary/DiaryListView.vue'),
    props: route => ({ userId: route.params.userId }),
    meta: { requiresAuth: true },
  },
];