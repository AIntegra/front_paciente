import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/front_paciente/",
  plugins: [react()],
});
