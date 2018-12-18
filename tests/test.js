const path = require("path")
const axios = require("axios")
const Renderer = require("../lib")
var renderer = new Renderer()
renderer.resources = path.resolve(__dirname, "resources")
renderer.nodemodules = path.resolve(__dirname,'../node_modules')

const express = require("express")
const app = express()
renderer.webpackCommon.module.rules.push({
    test: /\.styl(us)?$/,
    use: [
        'vue-style-loader',
        'css-loader',
        'stylus-loader'
    ]
})

app.get('/', async (req, res) => {
    try {
        var response = await axios.get('https://jsonplaceholder.typicode.com/todos/1')
        res.send(await renderer.render("views/pages/home", {
            info: response.data,
            msg: "Lala!",
            messageOuter: "Nla Nla"
        }))
    } catch (err) {
        res.send(err.toString())
        console.log(err)
    }
    
})

app.listen(2000, function() {
    console.log("listening on port 2000!")
})

async function testRender(){
    try {
        var response = await axios.get('https://jsonplaceholder.typicode.com/todos/1')
        var html = await renderer.render("views/pages/home", {
            info: response.data,
            msg: "Lala!",
            messageOuter: "Nla Nla"
        })
        return html
    } catch (error) {
        console.log(error)
    }
    
}

testRender()