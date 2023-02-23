import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Interactions from '../views/Interactions.vue'; 

const routes = [
  {
    path: '/',
    redirect: '/home'
  },

  {
    path: '/home',
    name: 'Home',
    component: Home
  },

  {
    path: '/interactions',
    name: 'Interactions',
    component: Interactions
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router