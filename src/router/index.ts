import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import { setupPageGuard } from './permission'
import { ChatLayout } from '@/views/chat/layout'
import { unescape } from 'querystring'
import { cwd } from 'process'
import post from '@/utils/request'
import { fetToken } from '@/api'
import { useAuthStore } from '@/store'


const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    component: ChatLayout,
    redirect: '/chat',
    beforeEnter: () => {
      let wxcode = geturlparam("code")

			if(wxcode != undefined && wxcode!=null && wxcode != ""){
        fetToken(wxcode)
          .then(r => {
						var authStore = useAuthStore()
            if(r.status === 'Success'){
							authStore.setToken(r["access_token"])
							console.log(authStore.token)
						}
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

function geturlparam(name){
  let params = new URL(location.href).searchParams;
  console.log(params)
  let code = params.get('code');
  return code
}


export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

setupPageGuard(router)

export async function setupRouter(app: App) {
  app.use(router)
  await router.isReady()
}
