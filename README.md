# servue
[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Codacy Badge][codacy-image]][codacy-url]
[![Coverage percentage][cov-image]][cov-url]
[![Greenkeeper badge][greenkeeper-image]][greenkeeper-url]

> Rendering engine for turning vue files into html

*Helping you serve vue with servue*

- [servue](#servue)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Creating your Vue file](#creating-your-vue-file)
    - [Express Usage](#express-usage)
    - [Koa Usage](#koa-usage)
    - [Setting custom path variables](#setting-custom-path-variables)
    - [Using a custom loader](#using-a-custom-loader)
  - [Layouts & Head Management](#layouts--head-management)
  - [TODO](#todo)

## Installation

```sh
$ npm install --save servue
```

## Usage

### Creating your Vue file
`resources/home.vue`
```html
<template>
    <div id="app">
        {{ msg }}
    </div>
</template>
<script>
export default {
    data(){
        return {
            msg: "Hello World"
        }
    }
}
</script>
```
### Express Usage
`index.js`
```js
const Servue = require("servue")
const express = require("express")

const app = express()
var servue = new Servue(__dirname)

app.get('/', async (req, res) => {
    res.send(await servue.render('home.vue'))
})

app.listen(2000, () => console.log("listening to port 2000!"))
```

### Koa Usage
`index.js`
```js
const Servue = require("servue")
const Koa = require("koa")

var app = new Koa()
var servue = new Servue(__dirname)

app.use(async (ctx) => {
    ctx.body = await servue.render('home.vue')
})

http.createServer(app.handle()).listen(80)
```
### Setting custom path variables
You may use your own custom paths for folders
```js
//Sets views folder path
servue.resources = path.resolve(__dirname, "resources")

//path of node_modules
servue.nodemodules = path.resolve(__dirname, 'node_modules')
```

### Using a custom loader
Here we add support for the stylus language so it can be usedi n vue files
```js
servue.webpackCommon.module.rules.push({
    test: /\.styl(us)?$/,
    use: [
        'vue-style-loader',
        'css-loader',
        'stylus-loader'
    ]
})
```
```html
<template>
    <div class="red">
        This will be red
    </div>
</template>
<style lang="red">
    .red{
        color: red;
    }
</style>
```

## Layouts & Head Management
In your top-most layout level, import `headify`, and it will collect all head data and merge it into your `<head>`

`parent-layout.vue`
```html
<template>
    <div id="app">
        <slot></slot>
    </div>
</template>
<script>
//import servue-provided head management system (headify)
import headify from "headify";

export default {
    mixins: [
        headify
    ],
    head: function(object){ //object is inherited from child view (home.vue)
        return {
            meta: `
                <script src="https://unpkg.com/vue/dist/vue.js"><\/script>
                ${object.meta ? object.meta : ""}
            `,
            title: `
                <title>${object.title ? object.title + ' - My Website': 'My Website'}</title>
            `,
            lala: `<meta name="test">`
        }
    }
}
</script>
```

`home.vue`
```html
<template>
    <parent>
        Hello
    </parent>
</template>
<script>
import parent from "layouts/parent-layout.vue"\

export default {
    head: function (object){
        return {
            title: "Home" //when set: 'Home - My Website', when unset: 'My Website' - See parent-layout.vue
            //optional, add meta tags if needed
        }
    },
    components: {
        parent //layouts can be multiple layers deep
    }
}
</script>
```

## TODO

- [ ] Adding tests
- [ ] Precompilation function
- [ ] Improved error reporting
- [ ] Reduced memory usage 
- [ ] Improved documentation

[npm-image]: https://badge.fury.io/js/servue.svg
[npm-url]: https://npmjs.org/package/servue
[travis-image]: https://travis-ci.org/futureaus/servue.svg?branch=master
[travis-url]: https://travis-ci.org/futureaus/servue
[greenkeeper-image]: https://badges.greenkeeper.io/futureaus/servue.svg
[greenkeeper-url]:https://greenkeeper.io/
[cov-image]: https://codecov.io/gh/futureaus/servue/branch/master/graph/badge.svg
[cov-url]: https://codecov.io/gh/futureaus/servue
[codacy-image]: https://api.codacy.com/project/badge/Grade/c9e768a6c57b4da69e11f2fbe213edd0
[codacy-url]: https://www.codacy.com/app/DominusVilicus/servue?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=futureaus/servue&amp;utm_campaign=Badge_Grade
