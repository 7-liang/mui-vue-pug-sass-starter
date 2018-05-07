// src/app/home/App.vue

<template lang="pug">
#app
  header.mui-bar.mui-bar-nav
    h1.mui-title Mui-Vue-Pug-Sass-Starter

  .mui-content
    .mui-content-padded
      button.mu-btn.mui-btn-primary.mui-btn-block(type='button', v-on:tap='openAxios') 打开 Axios 测试页
</template>

<script>
/* global mui */
export default {
  name: 'home',
  data () {
    return {}
  },
  methods: {
    openAxios () {
      mui.openWindow({
        url: './axios.html',
        id: 'axios'
      })
    }
  },
  mounted () {
    mui.init()
  }
}
</script>
