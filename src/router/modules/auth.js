import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'
import UnlockAccountView from '@/views/auth/UnlockAccountView.vue'

export default [
  {
    path: '/auth/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: RegisterView,
    meta: { requiresAuth: false }
  },
  {
    path: '/auth/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordView,
    meta: { requiresAuth: false }
  },
  {
    path: '/auth/unlock-account',
    name: 'UnlockAccount',
    component: UnlockAccountView,
    meta: { requiresAuth: false }
  },
{
  path: '/auth/oauth/link',
  name: 'oauth-link',
  component: () => import('@/views/auth/OAuthLinkDecision.vue'),
},
{
  path: '/auth/signup-extra',
  name: 'signup-extra',
  component: () => import('@/views/auth/SignupExtra.vue'),
},
{
  path: '/oauth/:provider(google|kakao)/redirect/:_tail(.*)?',
  name: 'oauth-callback-any',
  component: () => import('@/views/auth/OAuthCallback.vue'),
  meta: { public: true },
},
]
