import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./shared/presentation/views/home.view.vue')
    },
    {
      path: '/monitoring',
      name: 'monitoring',
      component: () => import('./monitoring/presentation/views/dashboard.view.vue')
    },
    {
      path: '/infractions',
      name: 'infractions',
      component: () => import('./infractions/presentation/views/validation-panel.view.vue')
    },
    {
      path: '/citizen',
      name: 'citizen',
      component: () => import('./citizen/presentation/views/search-portal.view.vue')
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('./analytics/presentation/views/reports.view.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('./shared/presentation/views/page-not-found.view.vue')
    }
  ]
});

export default router;