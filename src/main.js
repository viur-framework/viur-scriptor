import { createApp } from 'vue'
import App from './App.vue'
import global from './global.js';
import { createPinia } from 'pinia' // Import

//import { basicSetup } from 'codemirror'
//import VueCodemirror from 'vue-codemirror'
import "@viur/viur-shoelace/dist/shoelace.js";
import "@viur/viur-shoelace/dist/styles/component.styles.js";
import "@viur/viur-shoelace/dist/themes/light.css";
import '@viur/viur-shoelace/dist/components/button/button.js';
import '@viur/viur-shoelace/dist/components/details-group/details-group.js';
import "@viur/viur-shoelace/dist/components/dropdown/dropdown.js";
import "@viur/viur-shoelace/dist/components/menu/menu.js";
import "@viur/viur-shoelace/dist/components/icon/icon.js";
import "@viur/viur-shoelace/dist/components/icon/icon.styles";
import "@viur/viur-shoelace/dist/components/card/card.styles";

// plugin-style
import { setBasePath } from '@viur/viur-shoelace/dist/utilities/base-path.js';
setBasePath('https://cdn.jsdelivr.net/npm/@viur/viur-shoelace@2.0.0-beta.62-viur-1/dist');

import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

import { createI18n } from 'vue-i18n';
import router from "./router/index"

import en from "./translations/en"
import de from "./translations/de"

console.log(`config: {config}`)
const app = createApp(App);
app.config.compilerOptions.isCustomElement = tag => tag.startsWith('sl-');
app.provide("global", global)
app.component('EasyDataTable', Vue3EasyDataTable);


const i18n = createI18n({
	legacy: false,
    locale: 'de', // set locale
    fallbackLocale: 'en', // set fallback locale
	messages: {"en": en, "de": de}
})

app.use(createPinia());
app.use(i18n);
app.use(router);


app.mount('#app')

