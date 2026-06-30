import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

import App from './App.vue'
import router from './router'
import {definePreset} from "@primeuix/themes";
import { createAnalyticsPlugin } from '@/plugins/analytics'


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(createAnalyticsPlugin({ router }))


const FlagIQPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}'
    },
    surface: {
      0: '#ffffff',
      50: 'light-dark({stone.50}, {zinc.50})',
      100: 'light-dark({stone.100}, {zinc.100})',
      200: 'light-dark({stone.200}, {zinc.200})',
      300: 'light-dark({stone.300}, {zinc.300})',
      400: 'light-dark({stone.400}, {zinc.400})',
      500: 'light-dark({stone.500}, {zinc.500})',
      600: 'light-dark({stone.600}, {zinc.600})',
      700: 'light-dark({stone.700}, {zinc.700})',
      800: 'light-dark({stone.800}, {zinc.800})',
      900: 'light-dark({stone.900}, {zinc.900})',
      950: 'light-dark({stone.950}, {zinc.950})'
    }
  }
});

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: '.p-dark',
    }
  },
  license: 'eyJpZCI6Ijg3NTFmNGFkLWQ5ZjUtNDE3MS05ZWZhLWQ3Mjk0MDdjZTY2OCIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODI3NTQ4MDAsImV4cCI6MTgxNDI5MDgwMH0.ydqUKGl9kjDwQwX9QfSfSfVMy7deeJKU7VL_nccuJ0sSEzTk_yeb-6zOb92p4yx3T9v4hhGuAw3vs3ta8jc-BQ'
});

app.mount('#app')
