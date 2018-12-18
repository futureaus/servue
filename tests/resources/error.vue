<template>
  <div>
    <h1 class="red">{{msg}}</h1>
    <foo hellodata="component"></foo>
  </div>
</template>
 
<script>
import foo from "../components/copy/component.vue";
export default {
    data: function () {
        return {
            msg: 'Hello world!',
            messageOuter: 'Say Foo'
        }
    },
    components: {
        foo
    }
}
</script>
 
<style>
  .red {
    color: #f00;
  }
</style> 
 