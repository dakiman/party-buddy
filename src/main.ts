import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router/index";
import PrimeVue from "primevue/config";
import Lara from "@primevue/themes/lara";
import { definePreset } from "@primevue/themes";
import "primeicons/primeicons.css";
import "@/assets/main.css";
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";
import ConfirmationService from "primevue/confirmationservice";
import { useAuthStore } from "@/stores/auth";
import { installAuthInterceptor } from "@/services/api";

const MyPreset = definePreset(Lara, {
  semantic: {
    primary: {
      50: "{violet.50}",
      100: "{violet.100}",
      200: "{violet.200}",
      300: "{violet.300}",
      400: "{violet.400}",
      500: "{violet.500}",
      600: "{violet.600}",
      700: "{violet.700}",
      800: "{violet.800}",
      900: "{violet.900}",
      950: "{violet.950}",
    },
    focusRing: {
      width: "2px",
      style: "solid",
      color: "{primary.400}",
      offset: "2px",
    },
    colorScheme: {
      // Dark-only app (html.my-app-dark is hardcoded); violet-tinted near-black ramp.
      dark: {
        surface: {
          0: "#ffffff",
          50: "#f5f4f9",
          100: "#e9e7f1",
          200: "#d4d0e3",
          300: "#b3adc9",
          400: "#8d86a8",
          500: "#6b6488",
          600: "#4f4a68",
          700: "#39354e",
          800: "#252136",
          900: "#161326",
          950: "#0b0a12",
        },
      },
    },
  },
});

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
    options: {
      darkModeSelector: ".my-app-dark",
    }
  },
});
app.use(ToastService);
app.use(ConfirmationService);
app.component("Toast", Toast);

// Ordering is load-bearing, twice over:
// 1. The store must be created BEFORE installAuthInterceptor — the store's init
//    GET /auth/user must bypass the 401 interceptor (a cold load with an expired
//    token should silently logout, not toast "Session expired" + redirect).
// 2. Both must run BEFORE mount — child views fire their first requests from
//    their own onMounted hooks, which run before App.vue's onMounted.
const authStore = useAuthStore(pinia);
installAuthInterceptor(authStore, router, app.config.globalProperties.$toast);

app.mount("#app");
