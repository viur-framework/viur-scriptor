<template>
  	<div class="app">
		  <div class="logo">
			  <img src="https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80&sat=-100&bri=-5"
				class="logo-img">
		  </div>
		  <div class="main">
				<div class="runner-wrap">
				  <div class="number">Vorgangsname: 3 / 25</div>
				<h1 class="headline">Hier können wir Änderungen abgleichen</h1>

				<div class="extended-inter">

				  <div v-for="i in 10" :key="index">

					<div class="container">
					  <div class="child-start">Variable</div>
					  <div class="child-end">
						<div class="from">
						  Wert Alt
						</div>

						  <span class="arrow">&#8594;</span>

						<div class="to">
						  Wert Neu
						</div>

					  </div>

					</div>

				  </div>
				</div>

				<sl-button
				   size="medium"
				   v-show="render"
				   variant="primary"> Weiter</sl-button>
				</div>
		  </div>
	</div>
</template>


<script setup lang="ts">
export interface Props {
    title: String,
    values: String[][],
}


import {ref} from 'vue';
import { useI18n } from 'vue-i18n';

const render = ref(true);

const {t} = useI18n();



const props = defineProps<Props>();
  console.log("values:", props.values)

</script>


<style scoped lang="less">
  .extended-inter {
    overflow-y: auto;
    max-height: 400px;
    margin-bottom: 20px;
  }

  .diff {
    flex:1 0 50%;
    align-items: flex-start;
  }

  .diff-start {
    display: flex;
    align-self: flex-start;
  }
  .diff-end {
    display: flex;
    align-self: flex-end;

  }

.container {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  flex-wrap: nowrap;
  margin-bottom: 10px;
}

.child-start {
  display: flex;
  align-items: center;
  order: 0;
  width: 20%;
  padding: .4em;
}

.child-end {
  order: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 15px;
  background-color: var(--sl-color-neutral-100);
  padding: .4em;
  flex: 1;
}

.from {
  margin-left: 5px;
  color: var(--sl-color-danger-600);
}

.arrow{
  color: var(--sl-color-primary-500);
}

.to {
  color: var(--sl-color-success-600);
}

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


</style>
