import { createRouter, createWebHistory } from 'vue-router'

const routes =[
  {
    path: '/',
    redirect:{name:'login'}
  },
  {
    path: '/login',
    name: 'login',
    component: ()=> import('@/pages/Login')
  },
  {
    path:"/chat",
    name:"chat",
    component: ()=> import('@/pages/Chat')
  },
  {
    path:"/:pathMatch(.*)",
    name:"404",
    component: ()=> import('@/pages/404')
  }
]

const router = createRouter({
  routes,
  history: createWebHistory(),
})




export default router
