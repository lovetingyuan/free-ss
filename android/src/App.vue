<template>
  <top-bar></top-bar>
  <main>
    <section>
      <Animation></Animation>
      <Terms></Terms>
      <br>
      <copy-button></copy-button>
    </section>
    <SsButton></SsButton>
    <br>
  </main>
</template>

<script lang="ts">
import { onMounted } from 'vue'
import Animation from './components/AnimationPlayer.vue'
import TopBar from './components/TopBar.vue'
import Terms from './components/Terms.vue'
import CopyButton from './components/CopyButton.vue'
import SsButton from './components/SSButton.vue'

export default {
  name: 'App',
  components: {
    Animation, TopBar, Terms, CopyButton, SsButton
  },
}
</script>
`
<style scoped>
  main {
    text-align: center;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
</style>
