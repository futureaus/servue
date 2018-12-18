<template>
  <div>
    <h2>Hello from {{hellodata}}</h2>
    <button type="button" name="button" v-on:click="hello(hellodata)">{{hellodata}}</button>
  <subcomponent subdata="subcomponent"></subcomponent>
  </div>
  
</template>
 
<script>
  import subcomponent from './subcomponent.vue';
  export default {
    props: {
      hellodata: {
        default: "default",
        type: String,
        required: true
      }
    },
    data: function () {
      return {
      }
    },
    components: {
      subcomponent
    }
  }
</script> 
