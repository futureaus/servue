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
import parent from "views/layouts/parent.vue"
import axios from "axios";
import foo from "views/components/component.vue";
import messageComp from "views/components/message-comp.vue";
import users from "views/components/users.vue";
import simple from "simple-vue-component-test/simple.vue";
import HelloMixin from "views/mixins/helloMixin.js"

export default {
    mixins: [HelloMixin],
    head: function (object){
        return {
            title: "lala"
        }
    },
    data: function(){
        return {
            msg: "Hello world!",
            messageOuter: "Say Foo"
        }
    },
    props: {
        title: {
            type: String,
            default: ""
        },
        users: {
            type: Array,
            default: function() {
                return [{ name: "John" }];
            }
        }
    },
    components: {
        foo,
        messageComp,
        users,
        simple,
        parent
    },
    mounted: async function(){
        var response = await axios.get('https://jsonplaceholder.typicode.com/todos/1')
        response.data.lol = 'test'
        this.info = response.data
        Object.assign(this, {
            asdasd: "Hello world!",
            messageasdasdOuter: "Say Foo"
        })
    },
};
</script>
<style lang="stylus">
    @import 'test'

    .red{
        color red
    }
</style>