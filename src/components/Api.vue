<template>
    <div class="scroll">
        <div class="bind">
        <h1 class="headline coloured-headline">
            {{ moduleConfig.name }} Modul
        </h1>
        <p class="paragraph">
            {{ moduleConfig.descr }}
        </p>
  
          <br>
  
        <h2 class="headline coloured-headline underline-headline">Funktionen</h2>
          <div class="box" v-for="(item, key) in moduleConfig['function']" :key="key">

            <h3 class="headline">{{ item.name }}</h3>
            <p class="paragraph">
                {{ item.docs }}

            </p>
            <br>
  
            <sl-details summary="Values">
                <div class="value-wrap">
              <div class="value" v-for="(arg, key) in item['args']">
                  <div class="value-info">
                      <div class="name">Name des Value:</div>
                      {{ key }}
                  </div>
                  <div class="value-info">
                      <div class="name">Typ:</div>
                      {{ arg['type'] }}
                  </div>
                  <div class="value-info">
                      <div class="name">noch was:</div>
                      {{ arg['default'] }}
                  </div>
              </div>
            </div>
            </sl-details>
          </div>
  
        <h2 class="headline coloured-headline underline-headline">Datenbankfelder</h2>


            <div class="data" v-for="(key, name) in structure">
                <div class="data-name">{{name}}</div>
                <div class="data-type">Typ: {{key.type}}</div>
                <div class="data-type">Description: {{key.descr}}</div>
                <code class="data-code">
                    <vue-json-pretty :data="key" :deep="1" :showDoubleQuotes="false" :showIcon="true" :showLine="false" :collapsedOnClickBrackets="true" />

                </code>


            </div>
        </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { Request } from "@viur/viur-vue-utils";
  import {defineComponent, onMounted, ref, computed, onBeforeMount} from "vue";
import { useGlobalStore } from "../stores/global";
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

const props = defineProps({
    moduleName: String,
})
const globalStore = useGlobalStore();
const structure = ref({}); 
const moduleConfig = computed(function(){
    return globalStore.modules.value[props.moduleName];
});

onBeforeMount(async function(){
    let url = `/vi/${props.moduleName.toLowerCase()}/structure`;

    let answ = await Request.get(url);
    if (answ.ok) {
        structure.value = (await answ.json())["structure"];

        console.log(" structure.value",  structure.value)
    }

});
</script>
  
  <style scoped lang="less">
  .scroll{
    flex: 1;
    overflow-y: auto;
  }
  
  .headline{
    margin-top: 0;
  }
  
  .coloured-headline{
    color: @mainColor;
  }
  
  .underline-headline{
    padding-bottom: var(--sl-spacing-medium);
    border-bottom: 1px solid @mainColor;
  }
  
  .box{
    box-shadow: 0 0 8px 0 rgba(0, 0, 0, .2);
    padding: 20px;
    margin-bottom: 40px;
    border-radius: var(--sl-border-radius-medium);
  }
  
  sl-details{
    &::part(header){
      padding: var(--sl-spacing-small) var(--sl-spacing-medium);
    }
  
    &::part(content){
      padding: var(--sl-spacing-small) var(--sl-spacing-medium);
    }
  
    &::part(prefix){
      display: none;
    }
  }
  
  .value-wrap{
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-gap: 20px;
  }
  
  .value{
    display: flex;
    flex-direction: column;
    font-size: .9em;
  }
  
  .value-info{
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    padding-bottom: 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid #ddd;
  
    &:first-child{
      border-top: 1px solid #ddd;
      padding-top: 8px;
    }
  }
  
  .name{
    font-weight: bold;
    width: 120px;
    margin-right: 10px;
  }

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
  .data{
  display: flex;
  flex-direction: column;
  padding: 15px;
}

.data-name{
  color: @mainColor;
  font-weight: bold;
  margin-bottom: 5px;
}

.data-type{
  margin-bottom: 10px;
  font-size: .9em;
}

.data-code{
  background-color: #f4f4f4;
  padding: 5px;
}
  </style>