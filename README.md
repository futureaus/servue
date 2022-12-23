# Servue

***Helping you serve vue with servue***

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
  - [Global State / Cross Component Data](#global-state--cross-component-data)
    - [Implementing it](#implementing-it)
    - [Example Use Case](#example-use-case)
  - [Precompiling Vue Pages](#precompiling-vue-pages)
  - [Future Of This Package](#future-of-this-package)
    - [To Do List](#to-do-list)
  - [Package Changelog / Version](#package-changelog--version)
    - [2.2](#22)
    - [2.x](#2x)
      - [Passing data from server](#passing-data-from-server)
    - [Used for](#used-for)

## Installation

```
npm install servue --save
```
Then install peer dependencies (so you can control your vue version)
```
npm install vue --save
npm install vue-server-renderer --save
npm install vue-template-compiler --save
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

> Ensure you wrap your app/root-level layout with `<servue>`. It is required for Servue to work.

### `layouts/parent.vue`
```html
<template>
    <servue>
        <template slot="head">
            <title><slot name="title"/></title>
        </template>
        <template slot="content">
            <h1>The page title is: <slot name="title"></slot></h1>
            <slot name="content"/>
        </template>
    </servue>
</template>
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
        parent //layouts can be nested, just provide the correct slots
    }
}
</script>
```
### Rendered Result
```html
<html>
    <head>
        <title>Home</title>
        <!-- CSS, state and head are all automatically injected here -->
    </head>
    <body>
        <div id="app">
            <h1>The page title is: Home</h1>
            Hello
        </div>
        <script>/** Vue client-side webpack bundle script is rendered here **/</script>
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
<html${ context.htmlattr ? ' ' + context.htmlattr : '' }>
    <head>
        ${context.head ? context.head : ''}
        ${context.renderResourceHints()}
        ${context.renderStyles()}
        ${context.renderState({windowKey: '__INITIAL_STATE__', contextKey: "data"})}
        ${context.renderState({windowKey: '__INITIAL_ROOTSTATE__', contextKey: "state"})}
    </head>
    <body>
        ${content}
        <script>${bundle.client}</script>
    </body>
</html>
`)
```

## Custom Preprocessor/Language Support
Here we add support for the LESS/SCSS/Stylus/pug preprocessor language so it can be used in our `.vue` files.

In this example, we use the `stylus-loader` packagetop to add stylus support to our package.

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

However, this will remove vue development warnings, so it is best to use `development` for debugging & dev as it enables vue dev-tools.

## Head Management
### `layouts/parent.vue`
```html
<template>
    <servue>
        <template slot="head">
            <title><slot name="title"/></title>
            <meta name="og:title" content="This is my Facebook OpenGraph title">
            <slot name="head"/> <!-- Pass slot for head in-case other child vues want to add additional elements to the head -->
        </template>
        <template slot="content">
            <h1>Page: <slot name="title"/></h1>
            <slot name="content"/>
        </template>
    </servue>
</template>
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
        parent //layouts can be nested, just provide the correct slots
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

## Global State / Cross Component Data
To manage state globally (across components) and maintain reactivity, Servue has implemented a feature that easily allows you to do so.

All of your components will have access to a reactive object (including 3rd-party components)
```js
this.$state
```

### Implementing it

In your root-level parent layout which you share across multiple pages, you must implement the following code:
```js
import statizer from "statizer" //this package is provided with Servue, so you don't need to add it as a dependency in package.json

/**
 * You must declare all properties that components will use up-front because
 * of the limitations of Vue's reactivity (which will be fixed in Vue 3.0)
 * 
 * To add new properties, you should be able to use:
 * ```js
 * Vue.set(this.$state, 'name', val)
 * ```
 */
statizer({
    me: {
        firstName: null,
        lastName: null,
        email: null,
        username: null,
        displayPicture: null
    }
})

export default {
    ...
}
```

### Example Use Case

```js
export default {
    async serverPrefetch(){
        // make async api request for user

        let me = {
            firstName: "Steve"
        }

        this.$state.firstName = me.firstName
    }
}

```
```js
export default {
    async serverPrefetch(){
        // make async api request for user

        let me = {
            firstName: "Steve"
        }

        /**
         * 
         * never reassign this.$state or it will lose reference to the global
         * object, and lose reactivity, if you want to assign a large number of
         * varibles to the global state, use Object.assign(this.$state, obj)
         */

        Object.assign(this.$state, {me})
    }
}
```

**Don't do this**
```js
this.$state = {foo: "bar" } // this will lose reference to the original global state
```


## Precompiling Vue Pages
It's a memory intensive process to compile the `.vue` SFCs. After they are compiled once, they are cached and rerendered at a far greater speed.

This means that the first time a `.vue` SFC is rendered, it will take a few seconds to do so. **You don't want this in a production environment**, so we have an option for you to precompile all `.vue` files so your users get the fastest speeds when visiting your website.

You can do this with the precompile function
```js
/**
 * ----------
 * IMPORTANT:
 * ----------
 * Make sure to only precompile the pages you need, eg: you don't need to
 * precompile header.vue` or footer.vue, only home.vue or about.vue,
 * so seperate the actual full pages into a seperate folder.
 */

/**
 * @param {string} folder - Folder that contains the .vue files to render
 * @returns {Promise<void>}
 */
await servue.precompile('pages')
```

## Future Of This Package
I may be further developing this package into a full MPA (multi-page apps) and SPA (single-page apps) capable application with internal routing using Vue Router.

It does somewhat unalign with the original goals of the project which was to easily integrate with `koa` and `express`, but it still will, just in a different way.

### To Do List

- [x] Implement state management
- [ ] Reduce RAM usage by deleting virtual memory files after caching the renderers
- [ ] Make package more applicable for single page applications (SPAs)
- [ ] Potentially create an option for creating and serving build/dist files (as it takes a lot of ram and CPU to regenerate each SFC)
- [ ] Add hot-reloading
- [ ] Improve docs, create website
- [ ] Alternatively, create a nuxtjs "competitor" with servues head management system and layouts

## Package Changelog / Version

### 2.2
You're no longer required to import the servue component in your master/parent layouts. It's automatically injected into every `.vue` SFC
```html
<template>
    <servue>
        Your content
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
**Now becomes**
```html
<template>
    <servue>
        Your content
    </servue>
</template>
```

### 2.x
#### Passing data from server
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
    let data = {...}
    servue.render('home', {data, ctx})
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

[Future Australia Party Website](https://future.org.au) - [Lumina Government Website](https://Lumina.com) - [Proma Times](https://promatimes.com)
