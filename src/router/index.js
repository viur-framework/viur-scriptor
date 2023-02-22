import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Interactions from '../views/Interactions.vue'; 

const routes = [
  {
    path: '/',
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
  history: createWebHistory(),
  routes
})

export default router