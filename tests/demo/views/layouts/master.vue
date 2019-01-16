<template>
    <servue>
        <template slot="content">
            <slot name="content"></slot>
        </template>
        <template slot="head">
            <title>{{ getTitle }}</title>
            <slot name="head"></slot>
        </template>
    </servue>
</template>
<script>
import servue from "servue.vue";

export default {
    components: {
        servue
    },
    computed: {
        getTitle(){
            let website = "My Website"
            return this.$slots.title ? this.$slots.title[0].text + ' - ' + website : website
        }
    }
}
</script>