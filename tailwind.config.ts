import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
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
			zIndex: {
				'40': '40',
				'50': '50',
				'60': '60',
				'70': '70',
				'80': '80',
				'90': '90',
				'100': '100',
			},
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
				'slide-up': {
					from: {
						transform: 'translateY(0)'
					},
					to: {
						transform: 'translateY(-100%)'
					}
				},
				'slide-down': {
					from: {
						transform: 'translateY(-100%)'
					},
					to: {
						transform: 'translateY(0)'
					}
				},
				'fade-in': {
					from: {
						opacity: '0'
					},
					to: {
						opacity: '1'
					}
				},
				'fade-out': {
					from: {
						opacity: '1'
					},
					to: {
						opacity: '0'
					}
				},
				'float-1': {
					'0%': { transform: 'translate(0, 0) rotate(0)' },
					'25%': { transform: 'translate(-5px, -10px) rotate(3deg)' },
					'50%': { transform: 'translate(0, -5px) rotate(0)' },
					'75%': { transform: 'translate(5px, 10px) rotate(-3deg)' },
					'100%': { transform: 'translate(0, 0) rotate(0)' }
				},
				'float-2': {
					'0%': { transform: 'translate(0, 0) rotate(0)' },
					'25%': { transform: 'translate(8px, -5px) rotate(-2deg)' },
					'50%': { transform: 'translate(3px, -12px) rotate(0)' },
					'75%': { transform: 'translate(-8px, 5px) rotate(2deg)' },
					'100%': { transform: 'translate(0, 0) rotate(0)' }
				},
				'float-3': {
					'0%': { transform: 'translate(0, 0) rotate(0)' },
					'20%': { transform: 'translate(-7px, 6px) rotate(2deg)' },
					'40%': { transform: 'translate(5px, -7px) rotate(-1deg)' },
					'60%': { transform: 'translate(-3px, -10px) rotate(0)' },
					'80%': { transform: 'translate(7px, 8px) rotate(1deg)' },
					'100%': { transform: 'translate(0, 0) rotate(0)' }
				},
				'float-4': {
					'0%': { transform: 'translate(0, 0) rotate(0)' },
					'30%': { transform: 'translate(10px, -8px) rotate(-3deg)' },
					'50%': { transform: 'translate(5px, 5px) rotate(0)' },
					'70%': { transform: 'translate(-10px, -4px) rotate(3deg)' },
					'100%': { transform: 'translate(0, 0) rotate(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slide-up': 'slide-up 0.5s ease-out forwards',
				'slide-down': 'slide-down 0.5s ease-out forwards',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'float-1': 'float-1 9s ease-in-out infinite',
				'float-2': 'float-2 11s ease-in-out infinite',
				'float-3': 'float-3 13s ease-in-out infinite',
				'float-4': 'float-4 15s ease-in-out infinite',
			},
			fontFamily: {
				'serif': ['Playfair Display', 'Georgia', 'serif'],
				'sans': ['Inter', 'system-ui', 'sans-serif'],
			},
			backgroundImage: {
				'music-staff': "url(\"data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='staff' patternUnits='userSpaceOnUse' width='100%25' height='20' patternTransform='rotate(0)'%3E%3Cline x1='0' y1='10' x2='100%25' y2='10' stroke='%23D9D3C6' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23staff)'/%3E%3C/svg%3E\")",
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
