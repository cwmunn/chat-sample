import Vue from 'vue'
import Router from 'vue-router'
import Workspace from '@/views/Workspace'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Workspace',
      component: Workspace
    }
  ]
})
