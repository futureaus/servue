<template>
    <parent>
        <template slot="content">
            <h1 class="red">{{msg}}</h1>
            <foo hellodata="component"></foo>
            <p>{{$root.bar}}</p>
            <div v-html="$root.fakehtml"></div>
            <h1>{{title}}</h1>
            <p>Welcome to the {{title}} demo. Click a link:</p>
            <p>{{$root.sentence}}</p>
            <input v-model="messageOuter" placeholder="edit me">
            <button type="button" name="button" v-on:click="hello(messageOuter)">{{messageOuter}}</button>
            <message-comp :message="messageOuter"></message-comp>
            <users :users="users"></users>
            <pre>{{info}}</pre>
            <simple></simple>
        </template>
    </parent>
</template>
<script>
import axios from "axios";
import foo from "views/components/component.vue";
import messageComp from "views/components/message-comp.vue";
import users from "views/components/users.vue";
import simple from "simple-vue-component-test/simple.vue";
import parent from "views/layouts/parent.vue"

export default {
    props: {
        title: {
            type: String,
            default: ""
        },
        users: {
            type: Array,
            default: function() {
                return [{ name: "default" }];
            }
        }
    },
    data: function() {
        return {
        msg: "Hello world!",
        messageOuter: "Say Foo",
        info: ""
        };
    },
    created(){
        
    },
    mounted: async function(){
        var response = await axios.get('https://jsonplaceholder.typicode.com/todos/1')
        this.info = response.data
    },
    components: {
        foo,
        messageComp,
        users,
        simple,
        parent
    },
    meta: {
        title: "test"
    }
};
</script>
<style lang="stylus">
    @import 'test'

    .red{
        color red
    }
</style>
