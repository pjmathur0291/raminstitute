/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        dash: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        burgundy: {
          50:  'hsl(345, 50%, 96%)',
          100: 'hsl(345, 45%, 90%)',
          200: 'hsl(345, 50%, 80%)',
          300: 'hsl(345, 55%, 65%)',
          400: 'hsl(345, 60%, 50%)',
          500: 'hsl(345, 60%, 35%)',
          600: 'hsl(345, 65%, 28%)',
          700: 'hsl(345, 70%, 22%)',
          800: 'hsl(345, 75%, 15%)',
          900: 'hsl(345, 80%, 10%)',
          DEFAULT: 'hsl(345, 60%, 35%)',
        },
        gold: {
          50:  'hsl(43, 80%, 96%)',
          100: 'hsl(43, 75%, 90%)',
          200: 'hsl(43, 75%, 80%)',
          300: 'hsl(43, 75%, 65%)',
          400: 'hsl(43, 74%, 55%)',
          500: 'hsl(43, 74%, 50%)',
          600: 'hsl(43, 80%, 42%)',
          700: 'hsl(43, 85%, 32%)',
          DEFAULT: 'hsl(43, 74%, 50%)',
        },
        cream: {
          DEFAULT: 'hsl(30, 30%, 96%)',
          dark: 'hsl(30, 25%, 92%)',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'shine': { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
        'subtle-bounce': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'shine': 'shine 2.5s ease-in-out infinite',
        'subtle-bounce': 'subtle-bounce 2s ease-in-out infinite',
      },
      boxShadow: {
        'burgundy': '0 10px 30px -10px hsla(345, 60%, 35%, 0.35)',
        'gold': '0 10px 30px -10px hsla(43, 74%, 50%, 0.4)',
        'elegant': '0 20px 50px -20px hsla(0,0%,0%,0.15)',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
