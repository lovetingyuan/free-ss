import { createApp } from 'vue'
import { Plugins } from '@capacitor/core'
import App from './App.vue'
import 'normalize.css'
import './index.css'

const app = createApp(App)

app.mount('#app')

Plugins.App.addListener('backButton', () => {
  app.unmount('#app')
  return Plugins.App.exitApp();
})
