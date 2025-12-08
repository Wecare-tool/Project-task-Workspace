/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Wecare Brand Colors
                primary: {
                    50: '#e8f4f8',
                    100: '#c5e0e8',  // Pale Wecare Blue
                    200: '#a0cdd8',
                    300: '#7fbacb',  // Light Wecare Blue
                    400: '#5aa6bc',
                    500: '#3492ab',  // Wecare Blue (Primary)
                    600: '#2d7d95',
                    700: '#236e84',  // Dark Wecare Blue
                    800: '#1a5163',
                    900: '#164553',  // Deep Wecare Blue
                    950: '#0d2a33',
                },
                // Wecare Green for positive actions
                success: {
                    50: '#e8f5e9',
                    100: '#c8e6c9',
                    200: '#a5d6a7',
                    300: '#81c784',
                    400: '#66bb6a',
                    500: '#4CAF50',  // Wecare Green
                    600: '#43a047',
                    700: '#388e3c',
                    800: '#2e7d32',
                    900: '#1b5e20',
                },
                // Warning colors
                warning: {
                    50: '#fff8e1',
                    100: '#ffecb3',
                    200: '#ffe082',
                    300: '#ffd54f',
                    400: '#ffca28',
                    500: '#ffc107',
                    600: '#ffb300',
                    700: '#ffa000',
                    800: '#ff8f00',
                    900: '#ff6f00',
                },
                // Danger/Error colors
                danger: {
                    50: '#ffebee',
                    100: '#ffcdd2',
                    200: '#ef9a9a',
                    300: '#e57373',
                    400: '#ef5350',
                    500: '#f44336',
                    600: '#e53935',
                    700: '#d32f2f',
                    800: '#c62828',
                    900: '#b71c1c',
                },
                // Neutrals - Wecare Brand
                neutral: {
                    50: '#F8F9FA',   // Off White
                    100: '#E9ECEF',  // Light Grey
                    200: '#DEE2E6',
                    300: '#CED4DA',
                    400: '#ADB5BD',
                    500: '#6C757D',  // Medium Grey
                    600: '#495057',
                    700: '#343A40',  // Charcoal
                    800: '#212529',
                    900: '#1a1d20',
                },
                // Keeping dark scale for compatibility
                dark: {
                    50: '#F8F9FA',
                    100: '#E9ECEF',
                    200: '#DEE2E6',
                    300: '#CED4DA',
                    400: '#ADB5BD',
                    500: '#6C757D',
                    600: '#495057',
                    700: '#343A40',
                    800: '#212529',
                    900: '#0f172a',
                    950: '#020617',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                heading: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(52, 146, 171, 0.15)',
                'card': '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
                'elevated': '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-mesh': 'linear-gradient(135deg, var(--tw-gradient-from) 0%, var(--tw-gradient-via) 50%, var(--tw-gradient-to) 100%)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
        },
    },
    plugins: [],
}
