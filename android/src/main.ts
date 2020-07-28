import { createApp } from 'vue'
import { Plugins } from '@capacitor/core'
import App from './App.vue'
import 'normalize.css'
import './index.css'

const app = createApp(App)

app.config.isCustomElement = (tag) => {
  const customElementTags = [
    'lottie-player'
  ];
  return customElementTags.includes(tag)
}
app.mount('#app')

document.addEventListener('ionBackButton', (evt: CustomEventInit) => {
  evt.detail.register(-1, () => {
    app.unmount('#app')
    return Plugins.App.exitApp();
  });
});
