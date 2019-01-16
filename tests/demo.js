const path = require("path")
const Servue = require("../lib")
var servue = new Servue(__dirname)
servue.resources = path.resolve(__dirname, 'demo')
servue.mode = "production"

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

servue.precompile('views/pages')
    .then(()=>{console.log("Servue: precompiled views")})

app.get('/', async (req, res) => {
    try {
        res.send(await render())
    } catch (err) {
        console.error(err)
        throw err
    }
})


app.listen(2000, () => console.log("listening to port 2000!"))

async function render(){
    var html = await servue.render("views/pages/home", {
        info: {
            "userId": 1,
            "id": 1,
            "title": "delectus aut autem",
            "completed": false,
            "lol": "test"
        },
        msg: "Lala!",
        messageOuter: "Nla Nla"
    })
    return html
}