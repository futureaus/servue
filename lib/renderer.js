const { createBundleRenderer } = require("vue-server-renderer")
const { VueLoaderPlugin } = require("vue-loader")
const { promisify } = require('util')
const { Union } = require('unionfs')
const merge = require("webpack-merge")
const webpack = require("webpack")
const Cache = require("./cache")
const MFS = require("memory-fs")
const path = require("path")
const fs = require("fs")

/**
 * @typedef WebpackConfigType FIX THIS
 * @prop {string} server
 * @prop {string} client
 * @prop {Object} config
 */

class Renderer {
    /**
     * @prop {{max: number, maxAge: number}} cacheOptions - cacheoptions for LRU cache
     * @prop {[Renderer]} cache - LRU Cache
     * @prop {vueServerRenderer} renderer - instance of vue server renderer
     * @prop {String} resources - Path that contains resources and .vue files
     * @prop {String} nodeModulesPath - Path of node_modules folder
     * Webpack config here
     */
    constructor() {
        /**
         * File System Setup
         */
        let mfs = new MFS()
        let ufs = new Union()

        this.mfs = mfs
        this.ufs = ufs
            .use(mfs)
            .use(fs)

        this.cache = new Cache()

        this.webpackCommon = {
            module: {
                rules: [{
                        test: /\.vue$/,
                        loader: "vue-loader",
                    },
                    {
                        test: /\.js$/,
                        loader: "babel-loader",
                    },
                    {
                        test: /\.css$/,
                        use: [
                            "vue-style-loader",
                            "css-loader",
                        ],
                    }
                ]
            },
            plugins: [
                new VueLoaderPlugin(),
            ]
        }

        this.webpackServer = {
            target: "async-node",
            output: {
                libraryTarget: "commonjs2", //check if can be removed
            }
        }

        this.webpackClient = {}
    }

    /**
     * Add Precompilation function
     */

    async createEntry(filePath) {
        const fullPath = path.resolve(this.resources, filePath)
        const serverEntry = path.join(fullPath, "server-entry.js")
        const clientEntry = path.join(fullPath, "client-entry.js")

        this.mfs.mkdirpSync(fullPath)

        const appImport = `import Vue from "vue"
        import App from '${fullPath.replace(/\\/g, '/')}'

        var originalFunction = App.data

        function createApp(data){
            App.data = function(){return Object.assign(originalFunction(), data)}
            
            return new Vue({
                render: h => h(App)
            })
        }
        `

        const server = `${appImport}

        export default function(context){
            return createApp(context.data)
        }`

        const client = `${appImport}
        var store = window.__INITIAL_STATE__
        var app = createApp(store)
        app.$mount("#app", true)`

        this.mfs.writeFileSync(serverEntry, server, "utf-8")
        this.mfs.writeFileSync(clientEntry, client, "utf-8")

        return {
            serverEntry,
            clientEntry
        }
    }

    /**
     * @param {string} filePath
     * @param {object} data
     * @returns {Promise<WebpackConfigType>}
     */
    async createConfig(filePath, entries) {
        const clientBundlePath = `${filePath}.client-bundle.js`
        const serverBundlePath = `${filePath}.server-bundle.js`

        var fileConfig = {
            resolve: {
                modules: [
                    this.resources,
                    this.nodemodules,
                    path.resolve(__dirname, 'imports')
                ]
            },
            output:{
                path: this.resources
            }
        }
        
        let webpackServerConfig = merge(this.webpackCommon, this.webpackServer, fileConfig)
        let webpackClientConfig = merge(this.webpackCommon, this.webpackClient, fileConfig)
        
        webpackServerConfig.entry = entries.serverEntry
        webpackServerConfig.output.filename = serverBundlePath

        webpackClientConfig.entry = entries.clientEntry
        webpackClientConfig.output.filename = clientBundlePath

        return {
            serverPath: path.join(this.resources, serverBundlePath),
            clientPath: path.join(this.resources, clientBundlePath),
            config: [webpackServerConfig, webpackClientConfig],
        }
    }

    /**
     *
     * @param {WebpackConfigType} config
     * @returns {Promise<{client: string, server: string, clientBundlePath: string}>}
     */
    async createBundle(config) {
        const serverBundleFile = config.serverPath
        const clientBundleFile = config.clientPath
        
        try {
            const serverBundle = this.mfs.readFileSync(serverBundleFile, "utf-8")
            const clientBundle = this.mfs.readFileSync(clientBundleFile, "utf-8")
            return {
                server: serverBundle,
                client: clientBundle
            }
        } catch (err) {
            const compiler = webpack(config.config);
            compiler.inputFileSystem = this.ufs
            compiler.outputFileSystem = this.mfs
            compiler.run = promisify(compiler.run)
            let run = await compiler.run()

            let stats = run.stats

            for (let index in stats) {
                let stat = stats[index]

                if (stat.hasErrors()) {
                    throw stat.compilation.errors
                }

                const serverBundle = this.mfs.readFileSync(serverBundleFile, "utf-8")
                const clientBundle = this.mfs.readFileSync(clientBundleFile, "utf-8")

                return {
                    server: serverBundle,
                    client: clientBundle,
                }
            }
        }
    }

    async createRenderer(bundle){
        const renderer = createBundleRenderer(bundle.server, { //research directives
            runInNewContext: false,
            inject: false,
            template: `<!DOCTYPE html>
            <html>
                <head>
                    {{{ head }}}
                    {{{ renderResourceHints() }}}
                    {{{ renderStyles() }}}
                    {{{ renderState({ windowKey: '__INITIAL_STATE__', contextKey: "data"}) }}}
                </head>
                <body>
                    <!--vue-ssr-outlet-->
                    
                    <script>${ bundle.client }</script>
                </body>
            </html>`
        })

        return renderer
    }

    /**
     *
     * @param {string} filePath - .vue file path to render
     * @param {Object=} [data={}] - data to be inserted into .vue file when generating renderer
     * 
     * @returns {Promise<BundleRenderer>}
     */
    async getRenderer(filePath) {
        filePath = filePath + '.vue'

        if(this.cache[filePath]){
            return this.cache[filePath]
        }else{
            var entries = await this.createEntry(filePath)
            var config = await this.createConfig(filePath, entries)
            var bundle = await this.createBundle(config)
            var renderer = await this.createRenderer(bundle)
            
            this.cache[filePath] = renderer

            return renderer
        }
    }

    /**
     * render returns promise to the string which contians the rendered .vue file
     * @param {string} vueFile - path to vue single-file-component
     * @param {Object=} [data={}] - data to be inserted into .vue file when generating renderer
     * 
     * @returns {Promise<string>}
     */
    async render(vueFile, data = {}) {
        var renderer = await this.getRenderer(vueFile)
        
        return await renderer.renderToString({data: data})
    }


    /**
     * renderStream returns a stream from res.renderVue to the client
     * @param  {string} vueFile - full path to .vue component
     * @param {Object=} [data={}] - data to be inserted into .vue file when generating renderer
     * 
     * @return {Promise<NodeJS.ReadableStream>}
     */
    async renderStream(vueFile, data = {}) {
        var renderer = await this.getRenderer(vueFile)

        return await renderer.renderToStream(data)
    }

}

async function timeChecker(callback){
    const { performance } = require('perf_hooks')
    var iterations = 20
    var time1 = performance.now()
    for(var i = 0; i < iterations; i++){
        await callback()
    }
    var time2 = performance.now()
    console.log((time1-time2)/iterations)
}

module.exports = Renderer