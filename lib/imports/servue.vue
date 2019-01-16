<template>
    <div id="app">
        <slot name="content"></slot>
    </div>
</template>
<script>
const unaryTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr']

function renderStartTag(VNode){
    let html = `<${VNode.tag}`

    if(VNode.data){
        if(VNode.data.attrs){
            let attr = VNode.data.attrs
            for(let name in attr){
                if(attr[name] === ''){
                    html += ` ${name}`
                }else{
                    html += ` ${name}="${attr[name]}"`
                }
            }
        }
    }

    return html + '>'
}

function isUnaryTag(VNode){
    return (unaryTags.indexOf(VNode.tag) > -1)
}

function getFullTag(VNode){
    if(!VNode.tag) return VNode.text

    let html = renderStartTag(VNode)

    if(VNode.children){
        html += getChildren(VNode)
    }
    if(!isUnaryTag(VNode)){
        html += `</${VNode.tag}>`
    }
    return html
}

function getChildren(VNode){
    let html = ''
    for(let i in VNode.children){
        let child = VNode.children[i]
        html += getFullTag(child)
    }
    return html
}

let mixin = {
    created(){
        if(this.$isServer){
            let VNodes = this.$slots.head
            let renderedHead = ""

            for(let i in VNodes){
                let VNode = VNodes[i]
                renderedHead += getFullTag(VNode)
            }

            this.$ssrContext.head = renderedHead
        }
    }
}

export default {
    created(){
        if(this.$isServer){
            let VNodes = this.$slots.head
            let renderedHead = ""

            for(let i in VNodes){
                let VNode = VNodes[i]
                renderedHead += getFullTag(VNode)
            }

            this.$ssrContext.head = renderedHead
        }
    }
}
</script>