// src/app/nav/App.vue

<template lang="pug">
nav.mui-bar.mui-bar-tab
  a.mui-tab-item(v-for='tab in tabs', :class='{ "mui-active": activeIndex == tab.index }', v-on:tap='openTabPage(tab.index)')
    span.mui-icon(:class='tab.icon')
    span.mui-tab-label {{ tab.name }}
</template>

<script>
/* global mui plus */
export default {
  name: 'tabs',
  data () {
    return {
      // 当前激活的 tab 序号
      activeIndex: 0,
      // 定义 4 个 tab
      tabs: [
        { index: 0, id: 'home', name: '首页', icon: 'mui-icon-home', url: './home.html' },
        { index: 1, id: 'tab2', name: '消息', icon: 'mui-icon-email', url: 'http://www.dcloud.io/hellomui/examples/tableviews.html' },
        { index: 2, id: 'tab3', name: '通讯录', icon: 'mui-icon-contact', url: 'http://www.dcloud.io/hellomui/examples/indexed-list-select.html' },
        { index: 3, id: 'tab4', name: '设置', icon: 'mui-icon-gear', url: 'http://www.dcloud.io/hellomui/examples/icons.html' }
      ]
    }
  },
  methods: {
    openTabPage: function (index) {
      let styles = { top: 0, bottome: '45px', zindex: 1 }
      // 获取父 webview，即 index.html 所属 webview
      let main = plus.webview.currentWebview().parent()
      // 如果当前 tab 已被激活，则返回
      if (index === this.activeIndex) return
      // 如 plus 中不存在当前要打开的子 webview id，则新建并追加到父 webview
      if (!plus.webview.getWebviewById(this.tabs[index].id)) {
        let subWebview = plus.webview.create(this.tabs[index].url, this.tabs[index].id, styles)
        main.append(subWebview)
      }
      // 显示要打开的子 webview
      plus.webview.show(this.tabs[index].id)
      // 设置当前 tab index
      this.activeIndex = index
    }
  },
  mounted () {
    mui.init()
  }
}
</script>
