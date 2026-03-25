import { createRouter, createWebHashHistory } from 'vue-router'
import PagePlayers from '@/pages/PagePlayers.vue'
import PageSieges  from '@/pages/PageSieges.vue'
import PageRoster  from '@/pages/PageRoster.vue'
import PageAbout   from '@/pages/PageAbout.vue'
import PageLogin        from '@/pages/PageLogin.vue'
import PageRegister     from '@/pages/PageRegister.vue'
import PageVerifyEmail  from '@/pages/PageVerifyEmail.vue'
import { useAuthStore } from '@/store/auth'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',             redirect: '/players' },
    { path: '/players',      component: PagePlayers,     name: 'players' },
    { path: '/sieges',       component: PageSieges,      name: 'sieges'  },
    { path: '/roster',       component: PageRoster,      name: 'roster'  },
    { path: '/about',        component: PageAbout,       name: 'about'   },
    { path: '/login',        component: PageLogin,       name: 'login',       meta: { public: true } },
    { path: '/register',     component: PageRegister,    name: 'register',    meta: { public: true } },
    { path: '/verify-email', component: PageVerifyEmail, name: 'verify-email', meta: { public: true } },
  ],
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isAuthenticated) {
    next('/login')
  } else if (auth.isAuthenticated && to.meta.public && to.path !== '/verify-email') {
    next('/players')
  } else {
    next()
  }
})
