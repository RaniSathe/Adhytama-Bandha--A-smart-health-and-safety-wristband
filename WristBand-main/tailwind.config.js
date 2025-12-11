/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Dynamic status colors
    'text-red-500',
    'text-yellow-500',
    'text-green-500',
    'text-gray-500',
    'text-red-600',
    'text-green-600',
    // Dynamic gradient colors
    'from-red-50',
    'to-pink-50',
    'from-orange-50',
    'to-amber-50',
    'from-blue-50',
    'to-cyan-50',
    'from-teal-50',
    'to-emerald-50',
  ],
}
