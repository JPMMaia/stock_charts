import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import 'chartjs-adapter-luxon';

createApp(App).mount('#app')
