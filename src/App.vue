<script setup lang="ts">
import SsAccounts from './components/ss-accounts.vue'
import GithubHost from './components/github-host.vue'
import { ref } from 'vue'
const activeName = ref('ssaccounts')
</script>

<template>
  <el-tabs v-model="activeName" class="demo-tabs">
    <el-tab-pane label="ss-accounts" name="ssaccounts">
      <SsAccounts></SsAccounts>
    </el-tab-pane>
    <el-tab-pane label="github host" name="githubhost">
      <GithubHost></GithubHost>
    </el-tab-pane>
  </el-tabs>
</template>
