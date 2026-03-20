import { createRouter, createWebHashHistory } from 'vue-router'
import PagePlayers from '@/pages/PagePlayers.vue'
import PageSieges  from '@/pages/PageSieges.vue'
import PageRoster  from '@/pages/PageRoster.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',        redirect: '/players' },
    { path: '/players', component: PagePlayers, name: 'players' },
    { path: '/sieges',  component: PageSieges,  name: 'sieges'  },
    { path: '/roster',  component: PageRoster,  name: 'roster'  },
  ],
})
