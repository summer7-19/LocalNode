import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    // 前端打开
    server: {
        port: 5173,          
        strictPort: true,
        host:'0.0.0.0'  
    }  
})
