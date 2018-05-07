// src/app/index/App.vue
// 主模块文件

<template lang="pug">
</template>
<style lang="sass">
</style>

<script>
/* global mui */
export default {
  name: 'index',
  data () {
    return {}
  },
  mounted () {
    mui.init({
      wipeBack: true,
      subpages: [{
        url: './home.html',
        id: 'home',
        styles: {
          top: 0,
          bottom: '45px',
          zindex: 1
        }
      }, {
        url: './nav.html',
        id: 'nav',
        styles: {
          bottom: 0,
          height: '45px',
          zindex: 9
        }
      }]
    })
  }
}
</script>
