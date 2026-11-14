/** Resolve a design token CSS variable, keeping Tailwind opacity modifiers. */
const tok = (name) => `hsl(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // Design tokens: every colour maps to a CSS variable in styles/globals.css.
      // `primary` and `destructive` used to be hard-coded hex here, which
      // bypassed the CSS variables (and dark mode) entirely.
      fontFamily: {
        // layout.tsx loads Mona Sans into --font-sans, but Tailwind's font-sans
        // never pointed at it, so the brand font was not applied anywhere.
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: tok('border'),
        input: tok('input'),
        ring: tok('ring'),
        background: tok('background'),
        foreground: tok('foreground'),
        primary: {
          DEFAULT: tok('primary'),
          foreground: tok('primary-foreground'),
          hover: tok('primary-hover'),
          subtle: tok('primary-subtle'),
        },
        secondary: { DEFAULT: tok('secondary'), foreground: tok('secondary-foreground') },
        destructive: {
          DEFAULT: tok('destructive'),
          foreground: tok('destructive-foreground'),
          subtle: tok('destructive-subtle'),
        },
        success: {
          DEFAULT: tok('success'),
          foreground: tok('success-foreground'),
          subtle: tok('success-subtle'),
        },
        warning: {
          DEFAULT: tok('warning'),
          foreground: tok('warning-foreground'),
          strong: tok('warning-strong'),
          subtle: tok('warning-subtle'),
        },
        info: {
          DEFAULT: tok('info'),
          foreground: tok('info-foreground'),
          subtle: tok('info-subtle'),
        },
        muted: { DEFAULT: tok('muted'), foreground: tok('muted-foreground') },
        accent: { DEFAULT: tok('accent'), foreground: tok('accent-foreground') },
        popover: { DEFAULT: tok('popover'), foreground: tok('popover-foreground') },
        card: { DEFAULT: tok('card'), foreground: tok('card-foreground') },
        chart: {
          1: tok('chart-1'),
          2: tok('chart-2'),
          3: tok('chart-3'),
          4: tok('chart-4'),
          5: tok('chart-5'),
        },
        sidebar: {
          DEFAULT: tok('sidebar-background'),
          foreground: tok('sidebar-foreground'),
          primary: tok('sidebar-primary'),
          'primary-foreground': tok('sidebar-primary-foreground'),
          accent: tok('sidebar-accent'),
          'accent-foreground': tok('sidebar-accent-foreground'),
          border: tok('sidebar-border'),
          ring: tok('sidebar-ring'),
        },
        // Raw brand palette, kept for backwards compatibility. Prefer the
        // semantic tokens above in new code.
        mod: {
          purple: '#9747ff',
          green: '#129900',
          red: '#df403e',
          yellow: '#ffe502',
          blue: '#1563d7',
          lightPurple: '#f5edff',
          lightGreen: '#e8fbe6',
          lightRed: '#fcecec',
          lightYellow: '#fffce6',
          lightBlue: '#e8effb',
          gray: '#f5f5f5',
          darkGray: '#1e1e1e',
          mediumGray: '#9d9d9d',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
