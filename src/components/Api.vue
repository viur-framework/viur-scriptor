<template>
    <div class="scroll">
        <div class="bind">
        <h1 class="headline coloured-headline">
            {{ moduleConfig.name }} Modul
        </h1>
        <p class="paragraph" v-if="moduleConfig.descr">
            {{ moduleConfig.descr }}
        </p>

          <br>

        <h2 class="headline coloured-headline underline-headline" v-if="moduleConfig['functions']">Funktionen</h2>
          <div class="box" v-for="(item, key) in moduleConfig['functions']" :key="key">

			<div style="display: flex; align-items: center;">
			  <sl-badge variant="danger" pill style="margin-bottom: 17px;" pulse>async</sl-badge>
			  <h3 class="headline" style="margin-left: 10px;">{{ item.name }}</h3>
			</div>

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
                  <div class="value-info" v-if="arg['default']">
                      <div class="name">Standardwert:</div>
                      {{ arg['default'] }}
                  </div>
              </div>
            </div>
            </sl-details>
          </div>

        <h2 class="headline coloured-headline underline-headline" v-if="structure.value">Datenbankfelder</h2>

            <div class="data" v-if="isObject" v-for="(key, name) in structure.value">

                <div class="data-name">{{name}}</div>
                <div class="data-type">Typ: {{key.type}}</div>
                <div class="data-type">Description: {{key.descr}}</div>
                <code class="data-code">
                    <vue-json-pretty :data="key" :deep="1" :showDoubleQuotes="false" :showIcon="true" :showLine="false" :collapsedOnClickBrackets="true" />

                </code>


            </div>

              <template v-else>
                <template v-if="structure.type === 'normal'" >
                    <div class="data-wrap" v-for="(key, v) in structure.value">
                      <div class="data">
                        <h3 class="data-name">{{key[0]}}</h3>

                        <div class="data-type">
							<span>Typ:</span>
							{{key[1].type}}
						</div>
                        <div class="data-type">
							<span>Description:</span>
							{{key[1].descr}}
						</div>
                        <code class="data-code">
                            <vue-json-pretty :data="key[1]" :deep="1" :showDoubleQuotes="false" :showIcon="true" :showLine="false" :collapsedOnClickBrackets="true" />

                        </code>
                      </div>
                    </div>
                </template>
                <template v-else>
                    <div v-for="(key2, v2) in structure.value">

						<sl-details prefix="puzzle" :summary="v2" open>
							<div class="data-wrap" v-for="(key, v) in key2">
								<div class="data">

								  <h3 class="data-name">{{key[0]}}</h3>

								  <div class="data-type">
									  <span>Typ:</span>
									  {{key[1].type}}
								  </div>
								  <div class="data-type">
									  <span>Description:</span>
									  {{key[1].descr}}
								  </div>
								  <code class="data-code">
									  <vue-json-pretty :data="key[1]" :deep="1" :showDoubleQuotes="false" :showIcon="true" :showLine="false" :collapsedOnClickBrackets="true" />

								  </code>
								</div>
							  </div>
						</sl-details>

                    </div>
                 </template>

              </template>

        </div>
    </div>
  </template>

  <script setup lang="ts">
import {Request} from "@viur/vue-utils";
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

const isObject = computed(function(){
  return false;
});

onBeforeMount(async function(){
    console.log("moduleConfig.value ", moduleConfig.value)
    if (!moduleConfig.value.handler.startsWith("tree"))
    {
      let url = `/vi/${props.moduleName.toLowerCase()}/structure`;

      let answ = await Request.get(url);
      if (answ.ok) {
          structure.value["value"] = (await answ.json())["structure"];
          structure.value["type"] = "normal";
      }
    }
    else
    {
      let url = `/vi/${props.moduleName.toLowerCase()}/structure/leaf`;

      structure.value["value"] = {};
      structure.value["type"] = "tree";

      let answ = await Request.get(url);
      if (answ.ok) {
          structure.value["value"]["leaf"] = (await answ.json())["structure"];
      }

      url = `/vi/${props.moduleName.toLowerCase()}/structure/node`;

      answ = await Request.get(url);
      if (answ.ok) {
          structure.value["value"]["node"] = (await answ.json())["structure"];
      }
    }

});
</script>

<style scoped lang="less">
  .scroll{
    flex: 1;
    overflow-y: auto;
	padding: 20px 0;
  }

  .bind{
	width: 100%;
	max-width: 1200px;
	padding: 0 20px;
  }

  .headline{
    margin-top: 0;
  }

  .coloured-headline{
    color: @mainColor;
  }

  .coloured-headline.underline-headline{
    border-bottom: 1px solid @mainColor;
  }

  .underline-headline{
    padding-bottom: var(--sl-spacing-medium);
    border-bottom: 1px solid var(--sl-color-neutral-900);
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
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	grid-gap: 10px;
	margin-bottom: 30px;

  }

  .data-name{
	margin: 0;
	font-weight: 700;
	margin-bottom: 10px;
  }

  .data-type{
	font-size: .9em;
	background-color: var(--sl-color-neutral-100);
	padding: 6px 6px;

	span{
	  display: inline-block;
	  font-weight: 700;
	  width: 150px;
	}
  }

  .data-code{
	background-color: var(--sl-color-neutral-100);
	padding: 5px;
  }

  .data-wrap:not(:last-child){
	border-bottom: 1px solid var(--sl-color-neutral-400);
	margin-bottom: 20px;
  }

  sl-details{
	margin-bottom: 15px;

	&::part(base){
	  border: 1px solid var(--sl-color-neutral-700);
	}

	&::part(header){
	  border-radius: 0;
	}

	&::part(summary){
	  font-weight: 700;
	  font-size: 1.2em;
	}

	&[open]{
	  &::part(header) {
		border-bottom: 1px solid var(--sl-color-neutral-500);
	  }
	}
  }
</style>
