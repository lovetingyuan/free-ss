<template>
  <div class="button" :class="['button--' + size, 'button--' + (disabled ? 'disabled' : '')]" :style="{backgroundColor: bgColor}">
    {{ text }}
  </div>
</template>

<script>
export default {
  name: 'Button',
  props: {
    text: String,
    bgColor: String,
    disabled: Boolean,
    size: String // 'normal', 'large'
  }
}
</script>

<style scoped>
  .button {
    cursor: pointer;
    /* display: inline-block; */
    margin: 0 auto;
    /* box-sizing: border-box; */
    text-align: center;
    border-radius: 1000px;
    color: white;
  }
  .button--normal {
    font-size: 14px;
    line-height: 24px;
    padding: 10px 20px;
    width: 45%;
  }
  .button--large {
    width: 55%;
    font-size: 20px;
    line-height: 32px;
    padding: 15px 30px;
  }
  .button--disabled {
    opacity: .6;
    pointer-events: none;
  }
</style>
