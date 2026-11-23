import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const UiThemePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: 'var(--app-primary-50, {sky.50})',
      100: 'var(--app-primary-100, {sky.100})',
      200: 'var(--app-primary-200, {sky.200})',
      300: 'var(--app-primary-300, {sky.300})',
      400: 'var(--app-primary-400, {sky.400})',
      500: 'var(--app-primary-500, {sky.500})',
      600: 'var(--app-primary-600, {sky.600})',
      700: 'var(--app-primary-700, {sky.700})',
      800: 'var(--app-primary-800, {sky.800})',
      900: 'var(--app-primary-900, {sky.900})',
      950: 'var(--app-primary-950, {sky.950})',
    },
    colorScheme: {
      light: {
        primary: {
          color: 'var(--app-primary-500, {primary.500})',
          contrastColor: 'var(--primary-contrast, var(--app-on-primary, #ffffff))',
          hoverColor: 'var(--app-primary-600, {primary.600})',
          activeColor: 'var(--app-primary-700, {primary.700})',
        },
      },
    },
    formField: {
      borderRadius: '10px',
      paddingX: '12px',
      paddingY: '12px',
      focusBorderColor: '{primary.color}',
    },
  },
  components: {
    button: {
      root: { borderRadius: '10px' },
    },
  },
});
