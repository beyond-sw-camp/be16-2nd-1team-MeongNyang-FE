export default [
  {
    path: '/diarys/me',
    name: 'MyDiary',
    component: () => import('@/views/diary/DiaryListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/diarys/create',
    name: 'DiaryCreate',
    component: () => import('@/views/diary/DiaryCreateView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/diary/:id',
    name: 'DiaryDetail',
    component: () => import('@/views/diary/DiaryDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/diary/:id/edit',
    name: 'DiaryEdit',
    component: () => import('@/views/diary/DiaryEditView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/diarys/:userId',
    name: 'UserDiary',
    component: () => import('@/views/diary/UserDiaryListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/diarys',
    name: 'Diary',
    component: () => import('@/views/diary/DiaryListView.vue'),
    meta: { requiresAuth: true }
  }
]
