import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import Notifications from '@kyvg/vue3-notification'
import router from './router'
import vRole from './directives/v-role'



const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)
app.use(vuetify)
app.use(router)
app.use(createPinia())
app.use(Notifications)
app.directive('role', vRole)
app.mount('#app')
