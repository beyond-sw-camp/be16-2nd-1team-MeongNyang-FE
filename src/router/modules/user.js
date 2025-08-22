export default [
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/user/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/edit',
    name: 'ProfileEdit',
    component: () => import('@/views/user/ProfileEditView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/change-password',
    name: 'ChangePassword',
    component: () => import('@/views/user/ChangePasswordView.vue'),
    meta: { requiresAuth: true }
  }
]
