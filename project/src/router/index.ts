import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import FlowChart from '../views/FlowChart.vue'

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
    path: '/flowChart',
    name: 'FlowChart',
    component: FlowChart
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 