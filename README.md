# servue
[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage percentage][cov-image]][cov-url]
[![Greenkeeper badge](greenkeeper-image)](https://greenkeeper.io/)
[![Codacy Badge](codacy-image)](codacy-url)
> Rendering Engine for turning Vue files into Javascript Objects

## Installation

```sh
$ npm install --save vue-pronto
```

## Usage

Include the library at the top level like so

```js
const Pronto = require('vue-pronto');
```

Then init the renderer

```js
const renderer = new Pronto({object});
```

This returns 2 main functions.
It takes 3 params, 2 required and one optional.
```js
renderer.RenderToString(componentPath, data, [vueOptions]);
renderer.RenderToStream(componentPath, data, [vueOptions]);
```

Both methods return a promise. Stream returns a stream, and String returns a string.

## RenderToStream


### renderer.RenderToStream(vuefile, data, vueOptions) ⇒ <code>Promise</code>
renderToStream returns a stream from res.renderVue to the client

**Kind**: instance method of [<code>Renderer</code>](#Renderer)
**Returns**: <code>Promise</code> - - Promise returns a Stream

| Param | Type | Description |
| --- | --- | --- |
| vuefile | <code>string</code> | full path to .vue component |
| data | <code>Object</code> | data to be inserted when generating vue class |
| vueOptions | <code>Object</code> | vue options to be used when generating head |

## RenderToString

### renderer.RenderToString(vuefile, data, vueOptions) ⇒ <code>Promise</code>
renderToStream returns a string from res.renderVue to the client

**Kind**: instance method of [<code>Renderer</code>](#Renderer)

| Param | Type |
| --- | --- |
| vuefile | <code>string</code> |
| data | <code>object</code> |
| vueOptions | <code>object</code> |


## VueOptions

```js
{
    rootPath: path.join(__dirname, '/../tests'),
    vueVersion: "2.3.4",
    template: {
        body: {
            start: '<body><div id="app">',
            end: '</div></body>'
        }
    },
    head: {
        metas: [
            {
                property: 'og:title',
                content: 'Page Title'
            },
            {
                name: 'twitter:title',
                content: 'Page Title'
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
            }
        ],
        scripts: [
            {src: 'https://unpkg.com/vue@2.3.4/dist/vue.js'}
        ], 
        styles: [

        ]
    }
    data: {
        thing: true
    }
```


## License

Apache-2.0 © [Daniel Cherubini](https://github.com/express-vue)


[npm-image]: https://badge.fury.io/js/futureaus/servue.svg
[npm-url]: https://npmjs.org/package/futureaus/servue
[travis-image]: https://travis-ci.org/futureaus/servue.svg?branch=master
[travis-url]: https://travis-ci.org/futureaus/servue
[greenkeeper-url]: https://badges.greenkeeper.io/futureaus/servue.svg
[cov-image]: https://codecov.io/gh/futureaus/servue/branch/master/graph/badge.svg
[cov-url]: https://codecov.io/gh/futureaus/servue
[codacy-url]: https://www.codacy.com/app/DominusVilicus/servue?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=futureaus/servue&amp;utm_campaign=Badge_Grade
[codacy-image]: https://api.codacy.com/project/badge/Grade/c9e768a6c57b4da69e11f2fbe213edd0
