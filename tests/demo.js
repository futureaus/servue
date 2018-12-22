const path = require("path")
const axios = require("axios")
const Servue = require("../lib")
var servue = new Servue(__dirname)
servue.nodemodules = path.resolve(__dirname,'../node_modules')

const express = require("express")
const app = express()

servue.webpackCommon.module.rules.push({
    test: /\.styl(us)?$/,
    use: [
        'vue-style-loader',
        'css-loader',
        'stylus-loader'
    ]
})

app.get('/', async (req, res) => {
    try {
        res.send(await render())
    } catch (err) {
        console.log(err)
        throw err
    }
})

app.listen(2000, () => console.log("listening to port 2000!"))

async function render(){
    var response = await axios.get('https://jsonplaceholder.typicode.com/todos/1')
    var html = await servue.render("views/pages/home", {
        info: response.data,
        msg: "Lala!",
        messageOuter: "Nla Nla"
    })
    return html
}