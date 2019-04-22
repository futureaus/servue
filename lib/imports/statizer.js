import Vue from "vue"

export default (state) => {

    let $state = Vue.observable(state)

    /**
     * Vue.mixin applies a mixin globablly to every component
     */
    Vue.mixin({
        beforeCreate(){
            this.$state = $state
        }
    })

    return $state
}