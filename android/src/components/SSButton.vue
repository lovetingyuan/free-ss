<template>
  <RoundButton size="normal" :bgColor="sscolor" :disabled="store.disabled" :text="buttonText" @click="onclick"></RoundButton>
</template>

<script lang="ts">
import RoundButton from './RoundButton.vue'
import { AppLauncher } from '@ionic-native/app-launcher';
import { ref, onMounted } from 'vue'
import { Plugins } from '@capacitor/core'
import store from '../store'
const packageName = 'com.github.shadowsocks'

export default {
  components: {
    RoundButton
  },
  setup () {
    const buttonText = ref('')
    const couldopen = ref(false)
    const sscolor = ref('')
    Plugins.App.canOpenUrl({url: packageName }).then((canopen) => {
      couldopen.value = canopen.value
      buttonText.value = canopen.value ? '打开Shadowsocks' : '去下载Shadowsocks'
    })
    onMounted(() => {
      sscolor.value = getComputedStyle(document.body).getPropertyValue('--ss-color')
    })
    const onclick = () => {
      if (!buttonText.value) return
      if (couldopen.value) {
        Plugins.App.openUrl({ url: packageName })
      } else {
        Plugins.Browser.open({ url: 'https://github.com/shadowsocks/shadowsocks-android/releases' })
      }
    }
    return { buttonText, onclick, sscolor, store }
  }
}
</script>
