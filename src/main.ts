import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router/index";
import PrimeVue from "primevue/config";
import Lara from "@primevue/themes/lara";
import { definePreset } from "@primevue/themes";
import "primeicons/primeicons.css";
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";

const MyPreset = definePreset(Lara, {
  semantic: {
    primary: {
      50: "{indigo.50}",
      100: "{indigo.100}",
      200: "{indigo.200}",
      300: "{indigo.300}",
      400: "{indigo.400}",
      500: "{indigo.500}",
      600: "{indigo.600}",
      700: "{indigo.700}",
      800: "{indigo.800}",
      900: "{indigo.900}",
      950: "{indigo.950}",
    },
    light: {
      surface: {
          0: '#ffffff',
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}'
      }
  },
  dark: {
      surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}'
      }
  },
    // focusRing: {
    //   width: "2px",
    //   style: "dashed",
    //   color: "{primary.color}",
    //   offset: "1px",
    // },
    colorScheme: {
      // light: {
      //   formField: {
      //     hoverBorderColor: "{primary.color}",
      //   },
      // },
      // dark: {
      //   formField: {
      //     hoverBorderColor: "{primary.color}",
      //   },
      // },
    },
  },
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
  },
});
app.use(ToastService);
app.component("Toast", Toast);
app.mount("#app");
