<template>
  <div class="container">
    <p>
      <el-button :disabled="loading" @click="fetchAccounts" type="primary">{{
        loading
          ? '获取中...'
          : '获取' +
            (allAccountsLink.length ? `(${allAccountsLink.length})` : '')
      }}</el-button>
      <el-button
        type="success"
        v-if="allAccountsLink.length"
        @click="copyLinks"
        :icon="copyIcon"
        circle
      >
      </el-button>
    </p>
    <div class="animation-container" v-if="loading" ref="playerRef"></div>
    <el-collapse v-else modal-value="accountList.map(v => v.name)">
      <el-collapse-item
        v-for="{ name, url, message, accounts, success } of accountList"
        :key="name"
        :name="name"
      >
        <template #title>
          <span v-if="success" class="success-title">
            <a v-if="url" :href="url" target="_blank"
              >{{ name }} ({{ accounts!.length }})</a
            >
            <span v-else>{{ name }} ({{ accounts!.length }})</span>
          </span>
          <span v-else class="failed-title" style="color: #888">
            <a v-if="url" :href="url" target="_blank">{{ name }}</a>
            <span v-else>{{ name }}</span>
          </span>
        </template>
        <ol v-if="success">
          <li v-for="ss of accounts" :key="ss">{{ ss }}</li>
        </ol>
        <p v-else>
          获取失败：<code>{{ message }}</code>
        </p>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { writeText } from '@tauri-apps/api/clipboard'
import animationData from '../assets/animation.json'
import lottie from 'lottie-web'
import { ref, watchEffect } from 'vue'
// import { ElMessage } from 'element-plus'
import { CopyDocument, Check } from '@element-plus/icons-vue'
const playerRef = ref<HTMLDivElement | null>(null)
const loading = ref(false)
const accountList = ref<AccountRes[]>([])
const allAccountsLink = ref<string[]>([])
const copyIcon = ref<any>(CopyDocument)

const copyLinks = () => {
  console.log(allAccountsLink.value)
  writeText(allAccountsLink.value.join('\n')).then(() => {
    copyIcon.value = Check
    // ElMessage({
    //   message: '拷贝完成',
    //   type: 'success',
    // })
  })
}

watchEffect(() => {
  if (loading.value && playerRef.value) {
    lottie.loadAnimation({
      container: playerRef.value, // the dom element
      renderer: 'canvas',
      loop: true,
      autoplay: true,
      animationData, // the animation data
    })
  }
})

const accounts = import.meta.glob<{
  default: {
    name: string
    url: string
    getAccounts: () => Promise<string[]>
  }
}>('../accounts/*.ts', { eager: true })

interface AccountRes {
  success: boolean
  accounts?: string[]
  name: string
  url: string
  message?: string
}

const fetchAccounts = () => {
  if (loading.value) return
  loading.value = true
  allAccountsLink.value = []
  copyIcon.value = CopyDocument

  // buttonText.value = '获取中...'
  const allSS: string[] = []
  const entries = Object.values(accounts).map((v) => v.default)
  return Promise.allSettled(entries.map((v) => v.getAccounts()))
    .then((res) => {
      // const accounts = new Set<string>()
      // buttonText.value = '获 取'
      accountList.value = res.map((result, i) => {
        const { name, url } = {
          name: entries[i].name,
          url: entries[i].url,
        }

        if (result.status === 'fulfilled') {
          allSS.push(...result.value)
          return {
            success: true,
            name,
            url,
            accounts: result.value || [],
          }
        }
        return {
          success: false,
          name,
          url,
          message: result.reason,
        }
      })
      allAccountsLink.value = allSS
      // if (accounts.size) {
      //   accountList.value = [...accounts]
      //   return writeText([...accounts].join('\n')).then(() => accounts.size)
      // }
      // return 0
    })
    .then(() => {
      loading.value = false
    })
}
</script>

<style scoped>
.success-title,
.success-title a {
  color: lightseagreen;
}

.failed-title,
.failed-title a {
  color: #888;
}

.success-title a,
.failed-title a {
  text-decoration: underline;
}

.animation-container {
  width: 300px;
  margin: 0 auto;
}
</style>
