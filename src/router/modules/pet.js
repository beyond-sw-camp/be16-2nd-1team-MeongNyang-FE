export default [
  {
    path: '/pets',
    name: 'Pets',
    component: () => import('@/views/pet/PetListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pets/new',
    name: 'PetCreate',
    component: () => import('@/views/pet/PetCreateView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pets/:id',
    name: 'PetDetail',
    component: () => import('@/views/pet/PetDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pets/:id/edit',
    name: 'PetEdit',
    component: () => import('@/views/pet/PetEditView.vue'),
    meta: { requiresAuth: true }
  }
]
