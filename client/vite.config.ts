import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    host: true,    // bind ทุก interface (0.0.0.0)
    port: 5173,    // หรือ port อื่นถ้าต้องการ
    strictPort: false // ถ้า port ถูกใช้งาน จะหาตัวอื่นให้
  }
})
