/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,mjs}",
    "./tests/**/*.{js,mjs}"
  ],
  safelist: [
    "mode-desktop",
    "mode-executive",
    "translate-x-7",
    "translate-x-1",
    "bg-purple-400",
    "bg-slate-400",
    "bg-blue-600",
    "text-white",
    "hidden",
    "active-window",
    "minimized",
    "text-slate-400",
    "text-slate-500",
    "text-emerald-400",
    "text-rose-400",
    "border-rose-500/40",
    "bg-rose-950/40"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
