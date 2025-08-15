export default [
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/chat/ChatListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat/:roomId',
    name: 'ChatRoom',
    component: () => import('@/views/chat/ChatRoomView.vue'),
    meta: { requiresAuth: true }
  }
]
