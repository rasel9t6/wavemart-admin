import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		fontSize: {
  			'heading1-bold': [
  				'50px',
  				{
  					lineHeight: '100%',
  					fontWeight: '700'
  				}
  			],
  			'heading2-bold': [
  				'30px',
  				{
  					lineHeight: '100%',
  					fontWeight: '700'
  				}
  			],
  			'heading3-bold': [
  				'24px',
  				{
  					lineHeight: '100%',
  					fontWeight: '700'
  				}
  			],
  			'heading4-bold': [
  				'20px',
  				{
  					lineHeight: '100%',
  					fontWeight: '700'
  				}
  			],
  			'body-bold': [
  				'18px',
  				{
  					lineHeight: '100%',
  					fontWeight: '700'
  				}
  			],
  			'body-semibold': [
  				'18px',
  				{
  					lineHeight: '100%',
  					fontWeight: '600'
  				}
  			],
  			'body-medium': [
  				'18px',
  				{
  					lineHeight: '100%',
  					fontWeight: '500'
  				}
  			],
  			'base-bold': [
  				'16px',
  				{
  					lineHeight: '100%',
  					fontWeight: '600'
  				}
  			],
  			'base-medium': [
  				'16px',
  				{
  					lineHeight: '100%',
  					fontWeight: '500'
  				}
  			]
  		},
  		colors: {
  			'white-1': '#F8F8F8',
  			'gray-1': '#616161',
  			'gray-2': '#E5E7EB',
  			'blue-1': '#005EBE',
  			'blue-2': '#E9F5FE',
  			'blue-3': '#F5F7F9',
  			'red-1': '#FF0000'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
