import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { setupPageGuard } from './permission'
import { ChatLayout } from '@/views/chat/layout'
import post from '@/utils/request'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    component: ChatLayout,
    redirect: '/chat',
    beforeEnter: () => {
      const wxcode = geturlparam('code')
      if (wxcode != undefined && wxcode != null && wxcode != '') {
        post({ url: 'https://peanutai.datapeanut.com/wechat_login_callback_peanutai/', data: { code: wxcode } }).then((r) => {

        })
      }
      console.log(wxcode)
    },
    children: [
      {
        path: '/chat/:uuid?',
        name: 'Chat',
        component: () => import('@/views/chat/index.vue'),
      },
    ],
  },

  {
    path: '/404',
    name: '404',
    component: () => import('@/views/exception/404/index.vue'),
  },

  {
    path: '/500',
    name: '500',
    component: () => import('@/views/exception/500/index.vue'),
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: '/404',
  },
]

function geturlparam(name) {
  const params = new URL(location.href).searchParams
  console.log(params)
  const code = params.get('code')
  return code
}

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

setupPageGuard(router)

export async function setupRouter(app: App) {
  app.use(router)
  await router.isReady()
}
