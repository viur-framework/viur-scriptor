<template>

  	<div class="app">
		  <div class="logo">
			  <img src="https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80&sat=-100&bri=-5"
				class="logo-img">
		  </div>
		  <div class="main">
				<div class="runner-wrap">
				  <div class="number">Vorgangsname: 4 / 25</div>
				<h1 class="headline">Wähl doch mal was aus :)</h1>
				<p class="paragraph">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
					invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
				</p>

				<div class="data-grid" label="Alignment">
					<sl-button
							variant="default"
							class="data-btn"
							size="medium"
							v-for="i in 9"
							:key="option" @click="() => selectOption(option, index)">
						<img src="https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80&sat=-100&bri=-5"
						class="data-btn-img"
						slot="prefix">
						Hallo {{ i }}
					</sl-button>
					<sl-button
							variant="default"
							class="data-btn active"
							size="medium"
							:key="option" @click="() => selectOption(option, index)">
						<img src="https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80&sat=-100&bri=-5"
						class="data-btn-img"
						slot="prefix">
						Hallo Active
					</sl-button>
				</div>

				<div class="checkbox-container">
					<sl-checkbox class="checkbox"
								 v-for="i in 9">
						Hallo {{ i }}
					</sl-checkbox>
				</div>


				<sl-button
				   size="medium"
				   v-show="render"
				   variant="primary"
				   @click="send"> {{ t("send") }} </sl-button>
				</div>
		  </div>
	</div>

</template>

<script setup lang="ts">
import {ref} from 'vue';
import { useI18n } from 'vue-i18n';
export interface Props {
    options: String[],
    multiple: boolean,
    text: String,
    title: String,
    select: Function,
}

const render = ref(true);
const props = defineProps<Props>();
const {t} = useI18n();

const entries = [];

const selectedOption = ref(-1);


</script>

<style lang="less" scoped>

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

.disabled {
  opacity: 0.5;
}

.checkbox-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
  margin-bottom: 10px;
}

.checkbox {
	min-width: 100px;
	font-size: 1em;

	&::part(base) {
	  font-size: 1em;
	}

  	&::part(control--checked){
	  border-color: var(--sl-color-primary-500);
	  background-color: var(--sl-color-primary-500);
	}
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
  margin-bottom: 20px;
}

.data-btn{
	&::part(base){
	  justify-content: flex-start;
	  padding-left: 0;
	}

  &.active{
	&::part(base) {
	  color: var(--sl-color-primary-500);
	  border-color: var(--sl-color-primary-500)
	}
  }
}

.data-btn-img{
  height: 100%;
  width: auto;
}

</style>
