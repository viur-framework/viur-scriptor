<template>

	<div class="app">
		  <div class="logo">
			  <img src="https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80&sat=-100&bri=-5"
				class="logo-img">
		  </div>
		  <div class="main">
				<div class="runner-wrap">
					<img src="https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80&sat=-100&bri=-5"
						class="runner-img">
					<div class="runner-inner">
						<div class="number">Vorgangsname: 3 / 25</div>
						<h1 class="headline">Hier bitte ein Inpur in den Input schreiben</h1>
						<p class="paragraph">
							Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
							invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
						</p>

						<sl-input v-if="props.type !== 'text'" :type="props.type + (props.useTime ? 'time-local' : '')" v-model="value" :readonly="!render"></sl-input>
						<sl-textarea v-else
								resize="none"
								class="label-on-left" v-model="value" ></sl-textarea>

						<sl-button
						   size="medium"
						   v-show="render"
						   variant="primary"
						   @click="send"> {{ t("send") }} </sl-button>
						</div>
					</div>
		  </div>
	</div>

</template>


<script setup lang="ts">
export interface Props {
    title: String,
    text: String,
    type: String,
    select: Function,
    empty: Boolean,
    useTime: Boolean
}


import {ref, watch} from 'vue';
import { useI18n } from 'vue-i18n';

const render = ref(true);
const {t} = useI18n();
const selectedValue = ref<boolean>(undefined);
const value = ref<String>("");

const error = ref<String>("");


const props = defineProps<Props>();

watch(value, (oldValue, newValue) => {
    if (value.value) {
        error.value = "";
    }
});

function send() {
    if (!render.value)
        return;

    if (!props.empty) {
        if (!value.value) {
            error.value = t("error.empty");
            return;
        }
    }

    let tmpValue = value.value;
    if (props.type === "date") {
        tmpValue = new Date(value.value).valueOf();
    }

    props.select(tmpValue);
    render.value = false;

}


</script>


<style scoped lang="less">
.app{
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	position: relative;
}

.main{
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	align-items: center;
	padding-top: 6em;
}


.logo{
	position: absolute;
	top: 20px;
	left: calc(50% - 3em);
	width: 6em;
	max-height: 6em;
}

.logo-img{
	width: 100%;
}

.runner-wrap{
  display: flex;
  flex-direction: row;
  max-width: 900px;
  padding: 20px;
  margin: auto 0;

  @media (max-width: 750px){
	flex-direction: column;
  }
}

.runner-inner{
  display: flex;
  flex-direction: column;
}

.runner-img{
  width: 30%;
  height: auto;
  object-fit: cover;
  margin-right: 40px;

  @media (max-width: 750px){
	margin-right: 0;
	margin-bottom: 40px;
  	width: 100%;
	height: 300px;
  }
}

.headline{
	margin-top: 15px;
	text-transform: uppercase;
	color: var(--sl-color-primary-500);
	font-size: 2.2em;
}

.number{
	color: var(--sl-color-primary-500);
	font-weight: normal;
	font-family: Ubuntu, sans-serif;
	font-size: .75em;
	border-radius: 5px;
	border: 1px solid var(--sl-color-primary-500);
	padding: .4em .6em;
	align-self: flex-start;
}

.paragraph{
	margin-bottom: 20px;
}

sl-button{
	display: flex;
	align-self: flex-end;
}

sl-input{
  margin-bottom: 20px;

  &::part(base){
	border-bottom: 2px solid var(--sl-color-primary-500)
  }

}

sl-textarea{
  margin-bottom: 20px;

  &::part(base){
	border-bottom: 2px solid var(--sl-color-primary-500)
  }

}

</style>
