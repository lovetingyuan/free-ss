<template>
  <div ref="playeref"></div>
</template>

<script lang="ts">
import animationData from '../assets/animation.json'
import lottie from 'lottie-web'
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const playeref = ref(null)
    onMounted(() => {
      lottie.loadAnimation({
        container: playeref.value, // the dom element
        renderer: 'canvas',
        loop: true,
        autoplay: true,
        animationData, // the animation data
      })
    })
    return { playeref }
  }
}
</script>
