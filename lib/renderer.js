const { createBundleRenderer } = require("vue-server-renderer")
const { VueLoaderPlugin } = require("vue-loader")
const { promisify } = require('util')
const { Union } = require('unionfs')
const merge = require("webpack-merge")
const webpack = require("webpack")
const MFS = require("memory-fs")
const find = require("find")
const path = require("path")
const fs = require("fs")

class Renderer {
    /**
     * @prop {[renderer]} cache - Cache
     * @prop {string} resources - Path that contains resources and .vue files
     * @prop {string} nodemodules - Path of node_modules folder - Optional
     * @prop {string} mode - Mode of webpack, can be development or production
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

        this.cache = {}

        this.mode = 'development'
        
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
                libraryTarget: "commonjs2"
            },
            plugins: [
                new webpack.DefinePlugin({
                    'process.env.VUE_ENV': '"server"'
                })
            ]
        }

        this.webpackClient = {}
    }

    /**
     * Precompile vue files in a certain folder
     * @param {string} rootdir - folder to render vue files like "pages"
     * 
     * @returns {void} - Returns promise of array of rendered html strings
     */
    precompile(rootdir){
        return new Promise((resolve, reject)=> {
            find.file(/\.vue$/, path.resolve(this.resources, rootdir), (files)=>{
                let promises = []
                for(let i in files){
                    let file = files[i]
                    file = file.replace(this.resources + path.sep, '')
                    file = file.replace(/\\/g, '/')
                    file = file.replace(/\.vue$/, '')
                    promises.push(this.getRenderer(file))
                }
                Promise.all(promises)
                    .then(() => resolve())
                    .catch(err => reject(err))
            })
        })
    }

    /**
     * Create entry files for webpack
     * 
     * @param {string} filePath
     */
    async createEntry(filePath) {
        const fullPath = path.resolve(this.resources, filePath)
        const serverEntry = path.join(fullPath, "server-entry.js")
        const clientEntry = path.join(fullPath, "client-entry.js")

        this.mfs.mkdirpSync(fullPath)

        const appImport = `import Vue from "vue"
        import App from '${fullPath.replace(/\\/g, '/')}'

        var defaultData = App.data

        function createApp(data){
            var mergedData = Object.assign(defaultData ? defaultData() : {}, data)
            
            App.data = () => (mergedData)
            
            return new Vue({
                render: h => h(App)
            })
        }
        `

        const server = `
        import Vue from "vue"
        import App from '${fullPath.replace(/\\/g, '/')}'

        var defaultData = App.data

        function createApp(data){
            var mergedData = Object.assign(defaultData ? defaultData() : {}, data)
            
            App.data = () => (mergedData)
            
            return new Vue({
                render: h => h(App)
            })
        }

        export default async function(context){
            if(App.asyncData){
                Object.assign(context.data, await App.asyncData(context))
            }
            return createApp(context.data)
        }`

        const client = `${appImport}
        var store = window.__INITIAL_STATE__
        var app = createApp(store)
        app.$mount("#app", true)
        `

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

        var commonConfig = {
            mode: this.mode,
            resolve: {
                modules: [
                    this.resources,
                    this.nodemodules ? this.nodemodules : 'node_modules',
                    path.resolve(__dirname, 'imports')
                ]
            },
            output:{
                path: this.resources
            }
        }
        
        let webpackServerConfig = merge(this.webpackCommon, this.webpackServer, commonConfig)
        let webpackClientConfig = merge(this.webpackCommon, this.webpackClient, commonConfig)
        
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
        
        const compiler = webpack(config.config)
        compiler.inputFileSystem = this.ufs
        compiler.outputFileSystem = this.mfs
        compiler.run = promisify(compiler.run)
        let run = await compiler.run()

        let stat = run.stats[0]

        if(stat.hasErrors()){
            throw stat.compilation.errors[0]
        }

        const serverBundle = this.mfs.readFileSync(serverBundleFile, "utf-8")
        const clientBundle = this.mfs.readFileSync(clientBundleFile, "utf-8")

        return {
            server: serverBundle,
            client: clientBundle,
        }
    }

    /**
     * Create vue-server-renderer bundle renderer
     * 
     * @param {object} bundle
     * @returns {Promise<BundleRenderer>} 
     */
    async createRenderer(bundle){
        return await createBundleRenderer(bundle.server, {
            template: async (content, context) => (
                `<!DOCTYPE html>
                <html${ context.htmlattr ? ' ' + context.htmlattr : '' }>
                    <head>
                        ${ context.head ? context.head : '' }
                        ${ context.renderResourceHints() }
                        ${ context.renderStyles() }
                        ${ context.renderState({ windowKey: '__INITIAL_STATE__', contextKey: "data"}) }
                    </head>
                    <body>
                        ${ content }
                        <script>${ bundle.client }</script>
                    </body>
                </html>`
            )
        })
    }

    /**
     *
     * @param {string} filePath - .vue file path to render
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
     * @param {Object} [data={}] - data to be inserted into .vue file when generating renderer
     * @param {Object} [ssrContext={}] - data to be inserted the SSRContext .vue file when generating renderer
     * 
     * @returns {Promise<string>}
     */
    async render(vueFile, data = {}, ssrContext = {}) {
        let defaultData = {
            htmlattr: '',
            head: '',
            data: data
        }
        data = Object.assign(defaultData, ssrContext)
        var renderer = await this.getRenderer(vueFile)
        return await renderer.renderToString(data)
    }

}

module.exports = Renderer