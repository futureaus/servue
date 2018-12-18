<template>
    <div id="app">
        <slot name="content"></slot>
    </div>
</template>
<script>
import headify from "headify";

export default {
    mixins: [
        headify
    ],
    head: function(object){
        return {
            meta: `
                <script src="https://unpkg.com/vue/dist/vue.js"><\/script>
                ${object.meta}
            `,//MIGHT HAVE ISSUES HERE
            title: `<title>${object.title ? object.title + ' - My Website': 'My Website'}</title>`
        }
    }
}
</script>