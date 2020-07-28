<template>
<div class="terms">
  <p>免责声明：仅用于学习交流，禁止非法用途，否则一切风险后果自负。</p>
  <div class="pretty p-icon p-round p-pulse">
    <input type="checkbox" v-model="store.agreed" />
    <div class="state p-success">
      <i class="icon mdi mdi-check"></i>
      <label>同意上述</label>
    </div>
  </div>
</div>

</template>

<script>
import store from '../store'
import 'pretty-checkbox'

export default {
  data() {
    return {
      store,
    }
  },
}
</script>

<style scoped>
  .terms {
    padding: 10px 40px;
    line-height: 1.5em;
    font-size: 16px;
  }
</style>
