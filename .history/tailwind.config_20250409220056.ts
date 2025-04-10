
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class", ".theme-color", ".theme-sync"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Palette de couleurs "sync" - maintenue pour compatibilité
				sync: {
					// Couleurs principales du design
					mint: '#9AE382', 
					teal: '#1C4B41', // Supprimé visuellement mais gardé pour compatibilité
					sand: '#EADCCE', 
					beige: '#F3EFE7', 
					crimson: '#C3017F', 
					
					// Nuances supplémentaires
					'mint-light': '#B5EAA5',
					'mint-dark': '#7BC268',
					'teal-light': '#2A6359', // Gardé pour compatibilité
					'teal-dark': '#0E332B', // Gardé pour compatibilité
					'sand-light': '#F5EBE0',
					'sand-dark': '#D6C2AD',
					'crimson-light': '#D94098',
					'crimson-dark': '#A30065',
					
					// Couleurs fonctionnelles
					success: '#9AE382',
					warning: '#FFCC66',
					danger: '#C3017F',
					info: '#66A5AD',
					
					// Fond
					background: '#FFFFFF',
					'background-light': '#F9F9F9',
					'card-bg': '#FFFFFF',
					'card-bg-alt': '#F3EFE7',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				slideUp: {
					from: { transform: 'translateY(10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				slideIn: {
					from: { transform: 'translateX(10px)', opacity: '0' },
					to: { transform: 'translateX(0)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.5s ease-out',
				'slide-up': 'slideUp 0.5s ease-out',
				'slide-in': 'slideIn 0.5s ease-out'
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				display: ['Work Sans', 'sans-serif']
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
