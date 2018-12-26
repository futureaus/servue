<template>
    <master>
        <template slot="content">
            <slot name="content"></slot>
        </template>
        <template slot="head">
            <script src="https://unpkg.com/vue/dist/vue.js"></script>
            <title>Hello</title>
        </template>
    </master>
</template>
<script>
import master from "views/layouts/master.vue"

export default {
    name: 'parent',
    components: {
        master
    },
    head: function(object){
        return {
            meta: `<meta name="test">`
        }
    }
}
</script>
