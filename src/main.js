import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import pinia from './pinia.js'
import i18n from './i18n.js'
import './style.css'

import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import Material from '@primeuix/themes/material';
import PrimeVue from 'primevue/config';
import { ConfirmationService, DialogService, ToastService } from "primevue";

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(PrimeVue, { theme: { preset: Material }, ripple: true })
app.use(ConfirmationService)
app.use(DialogService)
app.use(ToastService)
app.use(i18n)

app.mount('#app')