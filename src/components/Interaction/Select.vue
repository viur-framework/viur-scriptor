<template>
    <sl-card :disabled="!render" :class="!render ? 'disabled' : ''" class="interaction">

		<div class="interaction-img">
			<img src="https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80&sat=-100&bri=-5"
			class="">
		</div>

        <div slot="header">
            {{ props.title }}
        </div>

        <p class="paragraph">
			{{  props.text }}
		</p>

        <div v-if="!props.multiple" class="data-grid" label="Alignment">
            <sl-button  :variant="selectedOption === index ? 'success' : 'default'" :disabled="!render"
						size="medium"
						class="data-btn"
						v-for="(option, index) in Object.keys(props.options)"
						:key="option" @click="() => selectOption(option, index)">
				<img src="https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80&sat=-100&bri=-5"
						class="data-btn-img"
						slot="prefix">
                {{ props.options[option] }}
            </sl-button>
        </div>

		<div class="checkbox-container" v-else>
			<sl-checkbox class="checkbox"
						 :disabled="!render"
						 v-for="option in Object.keys(props.options)"
						 :key="option" @sl-change="(event) => selectRadioButton(event, option)">
                {{ props.options[option] }}
            </sl-checkbox>
		</div>

		<div slot="footer" v-if="props.multiple">
		  <sl-button
				 size="small"
				 variant="success"
				 v-show="render"
				 @click="send">
			  {{ t("send") }}
		  </sl-button>
		</div>

    </sl-card>
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

function selectOption(index: number, _index: number) {

  if (!render.value)
    return;


  render.value = false;
  props.select(index);

  selectedOption.value = _index;
}

function selectRadioButton(event: UIEvent, index: string) {
  if (!props.multiple)
    return;

  if (!render.value)
    return;

  if (event.target.checked)
    entries.push(index);
  else {
    const _index = entries.indexOf(index);
    if (_index !== -1) {
      entries.splice(_index, 1);
    }
  }
}

function send() {
  if (!props.multiple)
    return;

  if (!render.value)
    return;

  render.value = false;
  props.select(entries);
}


</script>

<style scoped lang="less">

.interaction-img{
	margin: -10px;
	display: flex;
	justify-content: center;
	align-items: center;
	width: calc(100% + 20px);
	height: 200px;
	margin-bottom: 20px;
	background-color: var(--sl-color-neutral-100);

	img{
	  object-fit: contain;
	  height: 100%;
	}
  }

  .disabled {
    opacity: 0.5;
  }
  .card-header {
    max-width: 450px;
  }

  .card-header [slot='header'] {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-header h3 {
    margin: 0;
  }

  .card-header sl-icon-button {
    font-size: var(--sl-font-size-medium);
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
  }

  .data-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 10px;
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
