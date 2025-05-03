import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
        // Match user request colors
        primary: 'hsl(var(--primary))', // Teal
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))', // Light Gray
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        accent: 'hsl(var(--accent))', // Coral
        'accent-foreground': 'hsl(var(--accent-foreground))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        destructive: 'hsl(var(--destructive))', // Added for potential error states
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        muted: 'hsl(var(--muted))', // Added for subtle text/backgrounds
        'muted-foreground': 'hsl(var(--muted-foreground))',
  		},
  		borderRadius: {
        // Maintain some rounding consistency
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)'
  		},
  		keyframes: {
        // Keep animations if needed, though tailwindcss-animate plugin is removed
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [], // Removed tailwindcss-animate
} satisfies Config;
