<template>
  <h2 class="subcomponent">Hello from {{subdata}}</h2>
</template>
 
<script>
  module.exports = {
    props: {
      subdata: {
        default: "default",
        type: String,
        required: true
      }
    },
    data: function () {
      return {
      }
    }
  }
</script> 

<style>
.subcomponent {
    color: green;
}
</style>
