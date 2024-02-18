/** @type {import('tailwindcss').Config} */

module.exports = {
	content: ['./index.html', './src/**/*.{html,js,ts,vue}'],
	theme: {
		extend: {
			transitionProperty: {
				height: 'height',
				spacing: 'margin, padding',
				width: 'width',
				fadetransform: 'opacity, transform',
			},
			maxWidth: {
				'1/2': '50%',
			},
			minWidth: {
				'1/2': '50%',
			},
		},
	},
	plugins: [require('@tailwindcss/forms'), require('daisyui')],
	darkMode: ['class', '[data-theme="dark"]'],
	daisyui: {
		logs: false,
		themes: [
			{
				light: {
					primary: '#fbbf24',
					secondary: '#C6FFF7',
					accent: '#14CC9E',
					neutral: '#383938',
					'base-100': '#F4F4F5',
					info: '#38BDF8',
					success: '#DAA520', // Замените зеленый на желто-золотой
					warning: '#EAB308',
					error: '#EF4444',
				},
			},
			{
				dark: {
					primary: '#fbbf24',
					secondary: '#C6FFF7',
					accent: '#0E8f7E',
					neutral: '#F4F4F5',
					'base-100': '#171717',
					info: '#38BDF8',
					success: '#DAA520',
					warning: '#EAB308',
					error: '#EF4444',
				},
			},
		],
		
	},
}
