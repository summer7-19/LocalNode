import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router/index.js'
import { useUserStore } from './store/user.js'
import './styles.css'
import { createPinia } from 'pinia'
createApp(App).use(createPinia()).use(router).use(ElementPlus).mount('#app')
