# Servue

*Helping you serve vue with servue*
[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Codacy Badge][codacy-image]][codacy-url]
[![Coverage percentage][cov-image]][cov-url]
[![Greenkeeper badge][greenkeeper-image]][greenkeeper-url]

> Rendering engine for turning vue files into html

- [Servue](#servue)
  - [Installation](#installation)
  - [What is servue?](#what-is-servue)
    - [Features](#features)
  - [Setup](#setup)
    - [Express Usage](#express-usage)
    - [Koa Usage](#koa-usage)
  - [Layouts & Views](#layouts--views)
    - [Setting custom path variables](#setting-custom-path-variables)
    - [Custom Language Support](#custom-language-support)
  - [Mode](#mode)
  - [Head Management](#head-management)
  - [Passing data to vue from server-side](#passing-data-to-vue-from-server-side)
  - [Precompiling Vue Pages](#precompiling-vue-pages)

## Installation

```
npm install servue -s
```

## What is servue?
Servue server-side-renders Vue Single File Components (`.vue` files) into html. It is a fully capable templating engine, and allows users to create nested layouts using slots and components.

The renderer provides the correct scripts, and styles on the client-side. It creates no extra build or compiled files. It's perfect for multi-page applications and **great for users wanting to use Vue with Express or Koa**

It's this easy to render `.vue` files:
```js
await servue.render('home') // renders "home.vue" into html string
```

### Features
- [x] Supports precompilation
- [x] Supports layouts
- [x] Supports templating
- [x] Supports server-side Rendering
- [x] Supports head management
- [x] Supports imports CSS files and other assets
- [x] Supports custom language preprocessors (less, pug, etc)

## Setup

### Express Usage
```js
const Servue = require("servue")
const express = require("express")

var app = express()
var servue = new Servue()

servue.resources = path.resolve(__dirname, "resources")

app.get('/', async (req, res) => {
    res.send(await servue.render('home')) // renders "./resources/home.vue"
})

app.listen(2000)
```

### Koa Usage
```js
const Servue = require("servue")
const Koa = require("koa")

var app = new Koa()
var servue = new Servue()

servue.resources = path.resolve(__dirname, "resources")

app.use(async (ctx) => {
    ctx.body = await servue.render('home') // renders "./resources/home.vue"
})

app.listen(2000)
```

## Layouts & Views
Servue fully supports templating features and allows for multiple and nested layouts using Vue slots.

Here's a simple example:

`layouts/parent.vue`
```html
<template>
    <servue>
        <template slot="content">
            <header>Page: <slot name="title"></slot></header>
            <slot name="content"></slot>
            <footer>My Footer</header>
        </template>
    </servue>
</template>
<script>
/**
 * IMPORTANT:
 * You must use "servue.vue" in your top-most layout as shown
 * It wraps the app in <div id="app"> so it can mount on the client-side
 * It is required for head management
 */
import servue from "servue.vue"

export default {
    components: {
        servue
    }
}
</script>
```
This layout has a slot for content named `content` and a slot for the title named `title`

Now, the home file can use this layout:

`home.vue`
```html
<template>
    <parent>
        <template slot="title">Home</template>
        <template slot="content">
            Hello
        </template>
    </parent>
</template>
<script>
import parent from "layouts/parent.vue"

export default {
    components: {
        parent //layouts can be multiple layers deep
    }
}
</script>
```
`result output (minus head & body)`
```html
<div id="app">
    <header>Page: Home</header>
    Hello
    <footer>My Footer</header>
</div>
```

### Setting custom path variables
You may use your own custom paths for folders
```js
//Sets views folder path which contains .vue .css .less .js and etc
servue.resources = path.resolve(__dirname, "resources")

//path of node_modules
servue.nodemodules = path.resolve(__dirname, 'node_modules')
```

### Custom Language Support
Here we add support for the stylus language so it can be used in our `.vue` files.

The same thing can be done for html langauges like pug, or other css pre-processors, like LESS or SCSS.

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

## Mode
For faster compilation, you can use the production version of vue.

```js
servue.mode = "production" //default: "development"
```

However, this will remove vue development warnings, so it is best to use `development` for debugging & dev.

## Head Management
In your top-most layout level, import `servue.vue`, a component automatically provided by Servue. It is needed to mount the app on the client-side and needed for head management

`layouts/parent.vue`
```html
<template>
    <servue>
        <template slot="content">
            <header>Page: <slot name="title"></slot></header>
            <slot name="content"></slot>
            <footer>My Footer</header>
        </template>
        <template slot="head">
            <title><slot name="title"></title>
            <meta name="meta1">
            <slot name="head"></slot>
        </template>
    </servue>
</template>
<script>
import servue from "servue.vue"

export default {
    components: {
        servue
    }
}
</script>
```

the `head` template slot is rendered into the `<head>` tags on the server-side. The `head` tag can be nested, as shown in `parent.vue`. This means that `home.vue` may optionally pass it's own head to the user.

`home.vue`
```html
<template>
    <parent>
        <template slot="title">Home</template>
        <template slot="content">
            Hello
        </template>
        <template slot="head">
            <meta name="meta2">
        </template>
    </parent>
</template>
<script>
import parent from "layouts/parent.vue"

export default {
    components: {
        parent //layouts can be multiple layers deep
    }
}
</script>
```
`head output`
```html
<head>
    <title>Home</title>
    <meta name="meta1">
    <meta name="meta2">
    <!-- SERVUE GENERATED STYLES -->
</head>
```

## Passing data to vue from server-side
You may want to pass data or some API data to your vue. You can simply do this through the context argument
```js
let request = await axios.get('...') 
let data = request.data // { "hello": "world" } 
await servue.render('home.vue', data)
```
This data is merged with your vue component's data function (if there is one), and can then be accessed by your vue file:

```html
<template>
    <div>
        {{ hello }}
    </div>
</template>
```
**Output:**
```html
<div>
    world
</div>
```
## Precompiling Vue Pages
You may want to precompile vue pages for your multiple-page application. You can do this with the precompile function
```js
/**
 * Since our package uses webpack to transform vue files into rendered
 * html strings, creating the bundle renderer for each page is memory
 * intensive. This means it's best to run the renderer for each page
 * and then cache the bundle so we can reuse it for later requests.
 * 
 * Make sure to only render the pages you need, eg: you don't need to
 * precompile header.vue or footer.vue, only home.vue or about.vue
 */

/**
 * @param {string} folder - Folder that contains the .vue files to render
 */
servue.precompile('pages')
```

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
