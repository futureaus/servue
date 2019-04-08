# Servue

*Helping you serve vue with servue*

[![Build Status][travis-image]][travis-url]
[![Codacy Badge][codacy-image]][codacy-url]
[![Coverage percentage][cov-image]][cov-url]
![Node Minimum Version][node]
[![NPM version][npm-image]][npm-url]
[![NPM Downloads][npm-downloads]][npm-url]
![Last Commit][last-commit]


[npm-image]: https://img.shields.io/npm/v/servue.svg
[npm-url]: https://npmjs.org/package/servue
[travis-image]: https://travis-ci.org/futureaus/servue.svg?branch=master
[travis-url]: https://travis-ci.org/futureaus/servue
[cov-image]: https://codecov.io/gh/futureaus/servue/branch/master/graph/badge.svg
[cov-url]: https://codecov.io/gh/futureaus/servue
[codacy-image]: https://api.codacy.com/project/badge/Grade/c9e768a6c57b4da69e11f2fbe213edd0
[codacy-url]: https://www.codacy.com/app/DominusVilicus/servue?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=futureaus/servue&amp;utm_campaign=Badge_Grade
[node]: https://img.shields.io/badge/node%20minimum-8-blue.svg
[npm-downloads]: https://img.shields.io/npm/dm/servue.svg?colorB=blue
[last-commit]: https://img.shields.io/github/last-commit/futureaus/servue.svg

> Server-side rendering engine that renders vue files into html strings

- [Servue](#servue)
  - [Installation](#installation)
  - [What is servue?](#what-is-servue)
    - [Features](#features)
  - [Setup](#setup)
    - [Express Usage](#express-usage)
    - [Koa Usage](#koa-usage)
  - [Layouts & Views](#layouts--views)
    - [`layouts/parent.vue`](#layoutsparentvue)
    - [`pages/home.vue`](#pageshomevue)
    - [Rendered Result](#rendered-result)
  - [Setting custom path variables](#setting-custom-path-variables)
  - [Custom html body template](#custom-html-body-template)
  - [Custom Preprocessor/Language Support](#custom-preprocessorlanguage-support)
  - [Mode](#mode)
  - [Head Management](#head-management)
    - [`layouts/parent.vue`](#layoutsparentvue-1)
    - [`home.vue`](#homevue)
  - [Passing data to vue from server-side](#passing-data-to-vue-from-server-side)
    - [Via `asyncData()` in .vue file](#via-asyncdata-in-vue-file)
    - [Via `data`](#via-data)
    - [Merge order](#merge-order)
  - [Precompiling Vue Pages](#precompiling-vue-pages)
  - [Migrating from 1.x to 2.x](#migrating-from-1x-to-2x)
    - [Passing data from server](#passing-data-from-server)

## Installation

```
npm install servue --save
```

## What is servue?
Servue server-side-renders Vue Single File Components (`.vue` files) into html. It is a fully capable templating engine, and allows users to create nested layouts using slots and components.

The renderer provides the correct scripts, and styles on the client-side. It creates no extra build/compiled files. It's perfect for multi-page applications and **great for users wanting to use Vue with Express or Koa**

It's this easy to render `.vue` files:
```js
await servue.render('home') // renders "home.vue" into html string
```

> Requires Node 8+

### Features
- [x] Supports precompilation
- [x] Supports layouts
- [x] Supports templating
- [x] Supports server-side Rendering
- [x] Supports head management
- [x] Supports imports CSS files and other assets
- [x] Supports custom language preprocessors (less, pug, etc)
- [x] No build or compile files, all in-memory
- [x] Supports custom templating

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

### `layouts/parent.vue`
```html
<template>
    <servue>
        <template slot="head">
            <title><slot name="title"></title>
        </template>
        <template slot="content">
            <h1>Page: <slot name="title"></h1>
            <slot name="content">
        </template>
    </servue>
</template>
<script>
//must import this
//required for client-side mounting and head management
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

### `pages/home.vue`
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
### Rendered Result
```html
<html>
    <head>
        <title>Home</title>
        <!-- Other Servue injections here -->
    </head>
    <body>
        <div id="app">
            <h1>Page: Home</h1>
            Hello
        </div>
        <script>/** client-side script is rendered here **/</script>
    </body>
</html>
```

## Setting custom path variables
You may use your own custom paths for folders
```js
//Sets views folder path which contains .vue .css .less .js and etc
servue.resources = path.resolve(__dirname, "resources")

//path of node_modules
servue.nodemodules = path.resolve(__dirname, 'node_modules')
```

## Custom html body template

```js
servue.template = (content, context, bundle) => (`
    <!DOCTYPE html>
    <html>
        <head>
            ${ context.head }
            ${ context.renderResourceHints() }
            ${ context.renderStyles() }
            ${ context.renderState({ windowKey: '__INITIAL_STATE__', contextKey: "data"}) }
        </head>
        <body>
            ${ content }
            <script>${ bundle.client }</script>
        </body>
    </html>
`)
```

## Custom Preprocessor/Language Support
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
servue.mode = "production" //default = "development"
```

However, this will remove vue development warnings, so it is best to use `development` for debugging & dev.

## Head Management
### `layouts/parent.vue`
```html
<template>
    <servue>
        <template slot="head">
            <title><slot name="title"></title>
            <meta name="mymeta">
            <slot name="head">
        </template>
        <template slot="content">
            <h1>Page: <slot name="title"></h1>
            <slot name="content">
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

### `home.vue`
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
        parent //layouts can be nested
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
    <!-- Other Servue injections here -->
</head>
```

## Passing data to vue from server-side
### Via `asyncData()` in .vue file
`asyncData()` is a custom feature provided by servue, it allows you to make asynchronous requests like API calls. It is called on the server-side.

Data returned from asyncData is merged into the `data()` function, and then also passed onto the client.

> It only works on the rendered file, and not inside subcomponents or layouts.
```js
router.get((ctx) => {
    ctx.body = await servue.render('pages/home', {ctx})
})
```

`pages/home.vue`
```js
export default {
    async asyncData(ssrContext){
        let ctx = ssrContext.ctx

        return {
            url: ctx.url,
            hello: "World"
        }
    }
}
```


### Via `data`

You can simply do this through the context argument
```js
let data = { "hello": "world" }
await servue.render('home', {data})
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
### Merge order
Data merges are shallow (via `Object.assign`) and have this priority:

1. `asyncData()` - If Provided
2. `servue.render('home', {data})` - If Provided
3. `data()` - If Provided


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

## Migrating from 1.x to 2.x

### Passing data from server
We've changed the way data is passed from the server to the vue files

```js
servue.render('home', data)
```
***becomes***
```js
servue.render('home', {data})
```

Instead of passing data through a typical route controller, you can now pass it *inside* from your `.vue` files (see `asyncData()` above)

This was done because `req/res` or `ctx` data is often required in `.vue` files so we have made it easier to pass data like ctx to the views, and allow routing to be simpler.

```js
router.get('home', (ctx)=>{
    servue.render('home', {ctx})
})
```
Accessible in asyncData by
```js
export default {
    async asyncData(ssrContext){
        let ctx = ssrContext.ctx
        let url = ctx.url
        return { url }
    }
}
```

