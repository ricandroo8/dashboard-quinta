import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const schoolCalendarUrl = env.SCHOOL_CALENDAR_URL;

  return {
    plugins: [react()],

    server: {
      proxy: {
        "/api/school-calendar": {
          target: "https://calendar.google.com",
          changeOrigin: true,

          rewrite: () => {
            const calendarUrl = new URL(schoolCalendarUrl);

            return `${calendarUrl.pathname}${calendarUrl.search}`;
          },
        },
      },
    },
  };
});