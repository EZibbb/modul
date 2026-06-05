/* Modul — shared Tailwind (Play CDN) config.
   Mirrors a tailwind.config.ts for Next.js + shadcn/ui. */
tailwind.config = {
  darkMode: 'class',
  theme: {
    container: { center: true, padding: '1.5rem', screens: { '2xl': '1320px' } },
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        subtle: 'hsl(var(--subtle))',
        border: 'hsl(var(--border))',
        'border-strong': 'hsl(var(--border-strong))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
          muted: 'hsl(var(--primary-muted))',
        },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        cyan: { DEFAULT: 'hsl(var(--cyan))', muted: 'hsl(var(--cyan-muted))' },
        success: { DEFAULT: 'hsl(var(--success))', muted: 'hsl(var(--success-muted))' },
        warning: { DEFAULT: 'hsl(var(--warning))', muted: 'hsl(var(--warning-muted))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))', muted: 'hsl(var(--destructive-muted))' },
        info: { DEFAULT: 'hsl(var(--info))', muted: 'hsl(var(--info-muted))' },
        data: {
          1: 'hsl(var(--data-1))', 2: 'hsl(var(--data-2))', 3: 'hsl(var(--data-3))',
          4: 'hsl(var(--data-4))', 5: 'hsl(var(--data-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
      },
      boxShadow: {
        xs: 'var(--shadow-xs)', sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)', lg: 'var(--shadow-lg)',
      },
      ringColor: { DEFAULT: 'hsl(var(--ring))' },
    },
  },
};
