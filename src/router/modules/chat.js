export default [
  {
    path: '/chat',
    component: () => import('@/views/chat/ChatView.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Chat',
        component: () => import('@/components/chat/ChatPlaceholder.vue')
      },
      {
        path: ':roomId',
        name: 'ChatRoom',
        component: () => import('@/components/chat/ChatRoom.vue'),
        props: true
      }
    ]
  }
]
