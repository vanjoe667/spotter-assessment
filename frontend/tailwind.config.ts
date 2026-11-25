import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        risk: {
          low: "#22c55e",
          moderate: "#eab308",
          high: "#f97316",
          severe: "#ef4444",
          no_travel: "#7f1d1d",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
