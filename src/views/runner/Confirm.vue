<template>

	<div class="app">
		  <div class="logo">
			  <img src="https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80&sat=-100&bri=-5"
				class="logo-img">
		  </div>
		  <div class="main">
				<div class="runner-wrap">
				  <div class="number">Vorgangsname: 2 / 25</div>
				<h1 class="headline">Hier Steht eine Frage?</h1>
				<p class="paragraph">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
					invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
				</p>
				<div slot="footer" class="btn-footer">
				  <sl-button :disabled="!render"
							 size="medium"
							 variant="danger"
							 :class="'accept-button ' + ((selectedValue != 0 && selectedValue !== undefined) ? 'selected-button' : '')"
							 @click="() => confirm(0)">
					  {{ t('no')}}
				  </sl-button>
					 <sl-button :disabled="!render"
							 	size="medium"
								variant="success"
								:class="'accept-button ' + ((selectedValue != 1 && selectedValue !== undefined) ? 'selected-button' : '')"
								@click="() => confirm(1)">
						 {{ t('yes') }}
					 </sl-button>
				  </div>
				</div>

		  </div>
	</div>

</template>


<script setup lang="ts">
export interface Props {
    title: String,
    text: String,
    select: Function,
    cancel: Boolean
}


import {ref} from 'vue';
import { useI18n } from 'vue-i18n';

const render = ref(true);
const {t} = useI18n();
const selectedValue = ref<number>(undefined);


const props = defineProps<Props>();

function confirm(state: number) {
    if (!render.value)
        return;

    render.value = false;
    selectedValue.value = state;
    if (props.select)
        props.select(state);
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
	flex-direction: column;
	max-width: 900px;
	padding: 20px;
	margin: auto 0;
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

.btn-footer{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

</style>
