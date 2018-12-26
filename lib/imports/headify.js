function getHeadRecursive(component){
    var head = {}
    if(component.$options.head){
        let childHead
        if(component.$parent){
            childHead = getHeadRecursive(component.$parent)
        }
        head = component.$options.head(childHead)
    }else{
        if(component.$parent){
            head = getHeadRecursive(component.$parent)
        }
    }
    
    return head
}

function processHead(headObject){
    var head = ''
    for(var i in headObject){
        head += headObject[i]
    }
    return head
}

export default {
    created(){
        if(this.$isServer){
            var headObject = getHeadRecursive(this)
            this.$ssrContext.head = processHead(headObject)
        }
    }
}
