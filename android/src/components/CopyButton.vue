<template>
  <RoundButton bgColor="#00c583" size="large" :disabled="store.disabled" :text="buttontext" @click="oncopy"></RoundButton>
</template>

<script lang="ts">
import { ref } from 'vue'
import { copytext, toast } from '../utils'
import store from '../store'
import RoundButton from './RoundButton.vue';
import providers from '../providers'
import { Plugins, HapticsNotificationType } from '@capacitor/core'; 

const fetchAllAccounts = () => {
  return Promise.all(providers.map(p => {
    return p().catch(() => [] as Account[])
  })).then(accounts => {
    const _accounts = accounts.filter(Boolean).reduce((a, b) => a.concat(b), [])
    return _accounts.map((a) => `ss://${btoa(a.method + ':' + a.password)}@${a.server}:${a.port}`)
  })
}

export default {
  components: { RoundButton },
  setup () {
    const buttontext = ref('点击获取账号')
    const oncopy = () => {
      store.loading = true
      buttontext.value = '请稍候...'
      let count = 0
      fetchAllAccounts().then(accounts => {
        if (!accounts.length) throw ''
        count = accounts.length
        copytext(accounts.join('\n')).then(() => {
          toast('复制到' + accounts.length + '个账号.')
          Plugins.Haptics.notification({
            type: HapticsNotificationType.SUCCESS
          })
        }).catch(() => {
          toast('复制失败.')
        })
      }).catch(() => {
        toast('获取账号失败 😟')
        // @ts-ignore
      }).finally(() => {
        store.loading = false
        buttontext.value = `点击获取账号(${count})`
      })
    }
    return { oncopy, buttontext, store }
  }
}
</script>
