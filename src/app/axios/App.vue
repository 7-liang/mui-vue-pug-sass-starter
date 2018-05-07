// src/app/axios/App.vue

<template lang="pug">
#app
  header.mui-bar.mui-bar-nav
    a.mui-action-back.mui-icon.mui-icon-left-nav.mui-pull-left
    h1.mui-title Axios 测试

  .mui-content
    .mui-content-padded 本示例引用了一个淘宝 api 接口，接口作用未知，请在下面输入框内任意输入一个产品关键词
      br
      | 例如：“老婆”
    .mui-input-group
      .mui-input-row
        input(type='text', placeholder='任意输入一个产品关键词', v-model='inputStr')
      .mui-button-row
        button.mui-btn.mui-btn-primary(type='button', v-on:tap='getJson') 获取 Json 数据

    ul.mui-table-view
      li.mui-table-view-cell(v-for='item in result') {{ item[0] }}
        span.mui-badge {{ item[1] }}
</template>

<script>
/* global mui */
// 从 node_module 中引入 axios
import axios from 'axios'
// 设置 axios 默认请求 url 前缀
axios.defaults.baseURL = 'https://suggest.taobao.com'

export default {
  name: 'axios',
  data () {
    return {
      inputStr: '老婆',
      result: []
    }
  },
  methods: {
    getJson: function () {
      // 如果输入框为空，则返回，并显示 toast 层
      if (!this.inputStr) return mui.toast('请输入任意一个产品关键词')
      let params = {
        params: {
          code: 'utf-8',
          q: this.inputStr
        }
      }
      axios
        .get('/sug', params)
        .then(res => {
          this.result = res.data.result
        })
        .catch(() => mui.toast('axios 请求失败'))
    }
  },
  mounted () {
    mui.init()
  }
}
</script>
