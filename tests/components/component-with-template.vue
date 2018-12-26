<template>
    <div>
        Rendered Successfully
    </div>
</template>
<script>
export default {
    created(){
        //if(this.$isServer){
            this.$ssrContext.head = `<meta name="test">`
            this.$ssrContext.htmlattr = `class="test"`
        //}
    }
}
</script>
