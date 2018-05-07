> 本文做为个人近几个月接触 Mui 的总结，主要通过 Vue 来模块化开发

# NodeJs & cnpm
此部分跳过，请自行脑补

# Vue-Cli
全局安装
> cnpm install --global vue-cli

初始化Vue
> vue init webpack mui-vue-pug-sass-starter

PS: vue-router 这一步，输入 n，其余全部默认

> ? Project name mui-vue-pug-sass-starter
? Project description A Vue.js project
? Author jun <jun@***.cn>
? Vue build standalone
? Install vue-router? No
? Use ESLint to lint your code? Yes
? Pick an ESLint preset Standard
? Set up unit tests Yes
? Pick a test runner jest
? Setup e2e tests with Nightwatch? Yes
? Should we run `npm install` for you after the project has been created? (recommended) npm

要最大化利用 Webview 运行效率，采用 Mpa 方案来进行 Vue 的开发，所以关闭 vue-router

---
 *漫长的等待后...*

---
# 配置篇

### 安装所需依赖
> cnpm install --save-dev glob node-sass sass-loader pug pug-loader pug-filters clean-webpack-plugin
> cnpm install --save axios
> cnpm install

### 目录结构
```
+-- builder
+-- config
+-- src
|   +-- app // 多页面入口，每个目录为一个页面，build 输出以目录为名的 html
|   |   +-- page1
|   |   |   --- App.vue  // 主模块
|   |   |   --- page1.js  // 入口，文件名同目录名
|   |   |   --- page1.pug  // html 模板，文件名同目录名
|   |   +-- page2
|   |   +-- ...
|   +-- assets  // 存放一些公共静态文件及 js 库
|   |   +-- img
|   |   +-- js
|   |   +-- sass
|   +-- components  // 公共 vue 组件目录
+-- static
|   --- mui.min.css  // 需修改 mui.ttf 路径为 ./
|   --- mui.min.js
|   --- mui.ttf 
```

### 修改 Vue 为 Mpa 多页面入口模式
为最大化利用 Webview，需修改 Vue 为多页面入口模式

##### build/utils.js

> 添加输出遍历多页面入口的函数
```
// 使用glob模块遍历导入多页面入口
const glob = require('glob')

exports.entries = (globPath) => {
  let entries = {}, baseName, tmp, pathName
  glob.sync(globPath)
    .forEach(entry => {
      baseName = path.basename(entry, path.extname(entry))
      tmp = entry.split('/').splice(-3)
      pathName = tmp.splice(0, 1) + '/' + baseName
      entries[pathName] = entry
    })
  return entries
}
```

##### build/webpack.base.conf.js
> 修改 module.exports.entry
```
  /**
   * 遍历 app 目录中所有子目录，生成多页面入口
   */
  entry: utils.entries('./src/app/**/*.js'),
```

##### build/webpack.dev.conf.js
> 注释掉单页面入口
```
    /* 关闭单页面入口
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    */
```
> 在最后添加多页面入口代码段
```
// 多页面入口配置
let templates = utils.entries('./src/app/**/*.pug')
for (let pathName in templates) {
  let conf = {
    filename: pathName + '.html',
    template: templates[pathName],
    inject: true,
    chunksSortMode: 'dependency'
  }
  if (pathName in devWebpackConfig.entry) {
    conf.chunks = ['manifest', 'vendor', pathName]
    conf.hash = true
  }
  devWebpackConfig.plugins.push(new HtmlWebpackPlugin(conf))
}
```

##### build/webpack.prod.conf.js
> 注释掉单页面入口代码段
```
    /* 关闭单面页入口
    new HtmlWebpackPlugin({
      filename: process.env.NODE_ENV === 'testing'
        ? 'index.html'
        : config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    */
```
> 在最后添加多页面入口代码段
```
// 多页面入口配置
let templates = utils.entries('./src/app/**/*.pug')
for (let pathName in templates) {
  let conf = {
    filename: pathName + '.html',
    template: templates[pathName],
    inject: true,
    chunksSortMode: 'dependency'
  }
  if (pathName in module.exports.entry) {
    conf.chunks = ['manifest', 'vendor', pathName]
    conf.hash = true
  }
  module.exports.plugins.push(new HtmlWebpackPlugin(conf))
}
```

### 配置 pug
##### build/webpack.base.conf.js
> 在 module.exports.module.rules 中添加 pug 定义
```
      {
        test: /\.pug$/,
        loader: 'pug-loader'
      },
```

### 其它配置
##### build/utils.js
> 修正 css 中引入外部文件（如字体、图片等）路径问题
```
    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader',
        /**
         * 修正css 引入外部字体、图片等路径
         */
        publicPath: '../../../'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
```

##### build/webpack.base.conf.js
> 定义路径别名 module.exports.resolve
```
  resolve: {
    extensions: ['.js', '.vue', '.json', 'scss', 'css'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      'assets': resolve('src/assets'),
      'components': resolve('src/components'),
      'js': resolve('src/assets/js'),
      'img': resolve('src/assets/img'),
      '@img': resolve('src/assets/img'),
      '@fonts': resolve('src/assets/fonts'),
      '@sass': resolve('src/assets/sass')
    }
  },
```
##### build/webpack.prod.conf.js
> run build 时自动清空 dist 目录
```
// 在头部 require
const CleanPlugin = require('clean-webpack-plugin')
// 在 const webpackConfig 代码段中的 plugins 数组内添加如下代码
    // build时清空dist目录
    new CleanPlugin(['../dist']),
```

##### config/index.js
> 修正 run build 后的 html 页面内的 路径问题
```
// module.exports.build.assertsPublicPath
    assetsPublicPath: '../',
```

##### package.json
> 修改 browserslist 项，自动适配浏览器
```
  "browserslist": [
    "> 1%",
    "not ie <= 8",
    "iOS >= 7",
    "Android > 4",
    "Firefox > 20",
    "last 5 versions"
  ]
```
---

# 应用篇

### 关于 ESLint
> 本文配置项中已开启 ESLint Standard 的支持，目的为规范代码的编写，具体 ESLint 的作用和用法，请自行脑补

### vue 如何整合 mui ？
经过多次试验，最终还是在主html模板中引入mui这种方式最为合适
> 复制 mui.min.js、mui.min.css、mui.ttf 到 static 目录
> 需要修改 mui.min.css 中 mui.ttf 的路径为 ./mui.ttf

### 创建页面入口
> src/app 目录为所有页面入口，每一个子目录代表一个页面，包含一个主模板、一个入口JS、一个主VUE模块
##### 范例（基于 Webview 的 tab bar）
> 在 src/app 目录下新建 index 目录和 nav 目录
```
+-- src
|   +-- app
|   |   +-- index
|   |   +-- nav
```
新建 index 模块
```
// src/app/index/index.pug
// 主模板，文件名称需和目录名一致

doctype html
html
  head
    meta(charset='UTF-8')
    title index
    meta(name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no')
    link(rel="stylesheet", href="../static/mui.min.css")
  body
    script(src='../static/mui.min.js')
    #app

```
```
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

```
```
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

```
> 因 mui 是在主模板中 script src 引入，在 模块和入口里没有定义，需在 script 段第一行加入 /* global mui */ 将mui全局化，如不加这一行，编译时会报错，如果用到了 plus ，则为 /* global mui plus */

> mui.init 或 mui.plusReady 等初始化函数，需写入 vue 生命周期 mounted 内

新建 nav 模块
> 可以直接将 src/app/index/index.js 和 src/app/index/index.pug 复制到 src/app/nav 目录下，并分别改名为 nav.js 和 nav.pug，这两个文件的内容可以不改动
```
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
        { index: 0, id: 'tab1', name: '首页', icon: 'mui-icon-home', url: './home.html' },
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

```
> 本示例中应用到了 vue 的特性，v-on:tap, v-bind:class, v-for

新建 home 模块
> 同 nav 模块，可直接复制 pug 与 js 文件到 src/app/home

```
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

```
新建 axios 模块
> 同上操作复制 pug 与 js 到 src/app/axios 目录
> 本示例示范 vue 官方推荐的 ajax 库 axios 的简单操作
> [点击查看 axios 中文文档](https://www.kancloud.cn/yunye/axios/234845)
```
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

```
> 至此，一个简单的，基于 Vue 的 mui 模块化开发示范大体结束

---

# 调试篇
> npm run build
> 输入上面一行命令，将我们的开发成果 build 出成品

### HBuilder 入场
请出我们久违了的 HBuilder，开始调试我们的成果
> 1. HBuilder >> 文件菜单 >> 选择目录
> 2. 选择 build 后生成的 dist 目录，并起个项目名称，然后完成
> 3. 左侧项目管理器中，鼠标右键点击上一步完成后出现的项目，选择右键菜单中 “转换成移动App”，此时，HBuilder 将会在 dist 目录下添加 manifest.json 文件
> 4. HBuilder 中打开 manifest.json 开始配置我们的 App，请注意要选择一下 页面入口这一项，这里我们设置成 app/index.html
> 5. 其他相关 manifest.json 的设置请参照 dcloud 官方文档

至此，本文档大体结束，可以按照我们之前的操作习惯在 HBuilder 中进行真机测试了。

---

> 后续，计划在本文档的基础上，再次整理一个新的文档出来
> 名称拟定为 Mui-Vue-TypeScript-Starter

本文档推荐IDE：[VS Code](https://code.visualstudio.com/)

