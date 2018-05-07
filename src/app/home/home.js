// src/app/index/index.js
// 入口文件，需和目录名一致
// 基本所有入口文件都可如下一致

import Vue from 'vue'
import App from './App'

// eslint-disable-next-line
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
