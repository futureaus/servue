const path = require("path")
const axios = require("axios")
const Renderer = require("../lib")
const fs = require('fs')
const sanitizehtml = require('sanitize-html')
const htmltag = require('html-tags')

var compPath = path.resolve(__dirname, 'components')

var genfiles = false

/**
 * Used to sanatize strings for jest comparison (removes script) so that tests aren't brittle
 * @param {string} val 
 */
function sanitize(val){
    var htmltags = htmltag.filter(e => e !== 'script')
    return sanitizehtml(val, {
        allowedTags: [...htmltags, 'meta', 'link', 'title'],
        allowedAttributes: false
    })
}

function createFile(component, value){
    fs.writeFileSync(path.resolve(__dirname, 'components', component + '.txt'), value)
}

function readFile(component, value){
    try{
        return fs.readFileSync(path.resolve(__dirname, 'components', component + '.txt'), 'utf-8')
    }catch(err){
        console.log("missing file " + component + ".vue")
    }
}

/**
 * ===============
 * Tests
 * ===============
 */

describe('render and cache component', ()=>{
    var renderer = new Renderer()
    renderer.resources = compPath

    let text = readFile(path.resolve(compPath, 'component'))

    test('renders component', async () => {
        let rendered = sanitize(await renderer.render('component'))
        if (genfiles) createFile('component', rendered)
        expect(rendered).toBe(text)
    }, 20000)
    
    test('caches component', async () => {
        let rendered = sanitize(await renderer.render('component'))
        expect(rendered).toBe(text)
    }, 30)
})

describe('shared renderer', () => {
    var renderer = new Renderer()
    renderer.resources = compPath
    
    test('renders component with data', async () => {
        let text = readFile(path.resolve(compPath, 'component-with-data'))
        let rendered = sanitize(await renderer.render('component-with-data', {
            hello: "world"
        }))
        if (genfiles) createFile('component-with-data', rendered)
        expect(rendered).toBe(text)
    }, 20000)
    
    test('renders component with merged data', async () => {
        let text = readFile(path.resolve(compPath, 'component-with-merged-data'))
        let rendered = sanitize(await renderer.render('component-with-merged-data'))
        if (genfiles) createFile('component-with-merged-data', rendered)
        expect(rendered).toBe(text)
    }, 20000)
    
    test('renders data without cross pollution', async () => {
        let text = readFile(path.resolve(compPath, 'component-with-data2'))
        let rendered = sanitize(await renderer.render('component-with-data', {
            
        }))
        if (genfiles) createFile('component-with-data2', rendered)
        expect(rendered).toBe(text)
    }, 20000)

    test('renders component with subcomponents', async () => {
        // TODO
    }, 20000)
    
    test('renders component with node module component', async () => {
        // TODO
    }, 20000)
    
    test('renders component with style', async () => {
        // TODO
    }, 20000)
    
    test('renders component with style dependency', async () => {
        // TODO
    }, 20000)

    test('renders component with no nodemodules', async () => {
        // TODO
    }, 20000)

    test('renders component with template items', async () => {
        var renderer = new Renderer()
        renderer.resources = compPath
        let text = readFile(path.resolve(compPath, 'component-with-template'))
        let rendered = sanitize(await renderer.render('component-with-template'))
        if (genfiles) createFile('component-with-template', rendered)
        expect(rendered).toBe(text)
    }, 20000)

    test('renders component with no basedir or nodemodules', async () => {
        // TODO
    }, 20000)

    test('renders component in production mode', async () => {
        // TODO
    }, 20000)

    test('fails with missing module', async () => {
        // TODO
    }, 20000)

    test('multilayered head management', async () => {
        // TODO
    }, 20000)
})

describe('renderer with modified webpack', ()=> {
    test('renders component with preprocessor', async () => {
        var renderer = new Renderer()
        renderer.resources = path.resolve(__dirname, "components")
        renderer.nodemodules = path.resolve(__dirname,'../node_modules')
    
        renderer.webpackCommon.module.rules.push({
            test: /\.styl(us)?$/,
            use: [
                'vue-style-loader',
                'css-loader',
                'stylus-loader'
            ]
        })
    }, 20000)
})