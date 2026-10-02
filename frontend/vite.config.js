import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Permite abrir o app pelo celular na mesma rede Wi-Fi (http://IP-DO-PC:5173).
    host: true,
    // Em desenvolvimento, repassa /api para o backend, como o Nginx fará em produção.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
