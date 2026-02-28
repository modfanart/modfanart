// vite.config.ts
import { defineConfig } from "file:///E:/mod/dashboard-v2/node_modules/vite/dist/node/index.js";
import react from "file:///E:/mod/dashboard-v2/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import dynamicImport from "file:///E:/mod/dashboard-v2/node_modules/vite-plugin-dynamic-import/dist/index.mjs";
var __vite_injected_original_dirname = "E:\\mod\\dashboard-v2";
var vite_config_default = defineConfig({
  plugins: [react(), dynamicImport()],
  assetsInclude: ["**/*.md"],
  resolve: {
    alias: {
      "@": path.join(__vite_injected_original_dirname, "src")
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false
        // ← add this (helps with self-signed certs if any)
        // Optional rewrite – only if you DON'T want /api stripped
        // rewrite: (path) => path,  // keeps /api in backend path
      }
    }
  },
  build: {
    outDir: "build"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxtb2RcXFxcZGFzaGJvYXJkLXYyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxtb2RcXFxcZGFzaGJvYXJkLXYyXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9tb2QvZGFzaGJvYXJkLXYyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgZHluYW1pY0ltcG9ydCBmcm9tICd2aXRlLXBsdWdpbi1keW5hbWljLWltcG9ydCdcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gICAgcGx1Z2luczogW3JlYWN0KCksIGR5bmFtaWNJbXBvcnQoKV0sXG4gICAgYXNzZXRzSW5jbHVkZTogWycqKi8qLm1kJ10sXG4gICAgcmVzb2x2ZToge1xuICAgICAgICBhbGlhczoge1xuICAgICAgICAgICAgJ0AnOiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnc3JjJyksXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgICAgcHJveHk6IHtcbiAgICAgICAgICAgICcvYXBpJzoge1xuICAgICAgICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MCcsXG4gICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNlY3VyZTogZmFsc2UsIC8vIFx1MjE5MCBhZGQgdGhpcyAoaGVscHMgd2l0aCBzZWxmLXNpZ25lZCBjZXJ0cyBpZiBhbnkpXG4gICAgICAgICAgICAgICAgLy8gT3B0aW9uYWwgcmV3cml0ZSBcdTIwMTMgb25seSBpZiB5b3UgRE9OJ1Qgd2FudCAvYXBpIHN0cmlwcGVkXG4gICAgICAgICAgICAgICAgLy8gcmV3cml0ZTogKHBhdGgpID0+IHBhdGgsICAvLyBrZWVwcyAvYXBpIGluIGJhY2tlbmQgcGF0aFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICAgIG91dERpcjogJ2J1aWxkJyxcbiAgICB9LFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBaVAsU0FBUyxvQkFBb0I7QUFDOVEsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixPQUFPLG1CQUFtQjtBQUgxQixJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixTQUFTLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQztBQUFBLEVBQ2xDLGVBQWUsQ0FBQyxTQUFTO0FBQUEsRUFDekIsU0FBUztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0gsS0FBSyxLQUFLLEtBQUssa0NBQVcsS0FBSztBQUFBLElBQ25DO0FBQUEsRUFDSjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osT0FBTztBQUFBLE1BQ0gsUUFBUTtBQUFBLFFBQ0osUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BR1o7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0gsUUFBUTtBQUFBLEVBQ1o7QUFDSixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
