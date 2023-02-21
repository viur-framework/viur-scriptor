<template>
	<div v-if="render">
	  <sl-details :summary="computedName" class="data-detail">
		<ModuleDetailsEntry v-for="entry in structure" :details="entry"></ModuleDetailsEntry>
	  </sl-details>
	</div>
</template>

<script lang="ts">
import {computed, onBeforeMount, ref} from "vue";
import {Request} from "@viur/viur-vue-utils";
import ModuleDetailsEntry from "./ModuleDetailsEntry.vue";

export default {
  props: {
    name: {
      type: String,
      required: true
    },
    group: {
      type: String,
      required: false,
      default: "",
    },
  },
  components: {ModuleDetailsEntry},
  name: "ModuleDetails",
  setup(props){
    let structure = ref<[]>([])
	  let render = ref<boolean>(false);
    onBeforeMount(async function(){
      let url = `/vi/${props.name.toLowerCase()}/structure`;
      if (props.group)
        url += "/" + props.group;



      let answ = await Request.get(url);
	  if (!answ.ok)
		  render.value = false;
	  else {
		  structure.value = (await answ.json())["structure"];
		  render.value = true;
	  }
    })


    let computedName = computed(function(){
      if (props.group)
        return `${props.name} (${props.group})`

      return props.name;
    })

    return {computedName, props, structure, render}
  }
}
</script>

<style scoped lang="less">
  .data-detail{
	  &::part(base){
		 overflow: hidden;
		border: none;
		box-shadow: none;
		border-radius: 0;
		font-size: .9em;
	   }
	  &::part(header){
		 padding: 15px;
		 box-shadow: 0 0 10px 0 rgba(0, 0, 0, .25);
		border-radius: 0;
	   }
	  &::part(prefix){
		 display: none;
	   }
	  &::part(content){
		 padding: 0;
	   }
  }
</style>
