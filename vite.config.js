import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // <--- La correction est ici ("plugin-react" au lieu de "react")
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})