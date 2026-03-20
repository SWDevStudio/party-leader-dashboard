import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/style/global.css'
import { router } from './router'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(router)
router.isReady().then(() => app.mount('#app'))
