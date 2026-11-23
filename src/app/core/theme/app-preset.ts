import { definePreset } from '@primeuix/themes';
import AuraBase from '@primeuix/themes/aura/base';
import button from '@primeuix/themes/aura/button';
import card from '@primeuix/themes/aura/card';
import confirmdialog from '@primeuix/themes/aura/confirmdialog';
import datatable from '@primeuix/themes/aura/datatable';
import datepicker from '@primeuix/themes/aura/datepicker';
import dialog from '@primeuix/themes/aura/dialog';
import floatlabel from '@primeuix/themes/aura/floatlabel';
import iconfield from '@primeuix/themes/aura/iconfield';
import inputnumber from '@primeuix/themes/aura/inputnumber';
import inputtext from '@primeuix/themes/aura/inputtext';
import paginator from '@primeuix/themes/aura/paginator';
import password from '@primeuix/themes/aura/password';
import ripple from '@primeuix/themes/aura/ripple';
import select from '@primeuix/themes/aura/select';
import skeleton from '@primeuix/themes/aura/skeleton';
import toast from '@primeuix/themes/aura/toast';
import toggleswitch from '@primeuix/themes/aura/toggleswitch';
import tooltip from '@primeuix/themes/aura/tooltip';

export const AppAuraPreset = definePreset(AuraBase, {
  license:
    'eyJpZCI6IjE3YjZkYzQyLWM2YzAtNDE5NS05Yjc4LTU1NDdkZTFkZjAyNyIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODgwMTg2MDYsImV4cCI6MTgxOTU1NDYwNn0.fDlIFkh2HcsdlUJLparB2E_Gt4qfYpP7RkK-jlryvqRlG1zpp4CRBOzzy4tfS5zJRz79OYCG2fR4kwfiNyj_Aw',
  components: {
    button,
    card,
    confirmdialog,
    datatable,
    datepicker,
    dialog,
    floatlabel,
    iconfield,
    inputnumber,
    inputtext,
    paginator,
    password,
    ripple,
    select,
    skeleton,
    toast,
    toggleswitch,
    tooltip,
  },
  semantic: {
    primary: {
      50: 'var(--app-primary-50)',
      100: 'var(--app-primary-100)',
      200: 'var(--app-primary-200)',
      300: 'var(--app-primary-300)',
      400: 'var(--app-primary-400)',
      500: 'var(--app-primary-500)',
      600: 'var(--app-primary-600)',
      700: 'var(--app-primary-700)',
      800: 'var(--app-primary-800)',
      900: 'var(--app-primary-900)',
      950: 'var(--app-primary-950)',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: 'var(--primary-contrast)',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
      },
    },
  },
});
