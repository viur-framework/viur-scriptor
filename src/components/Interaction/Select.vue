<template>
    <sl-card :disabled="!render" :class="!render ? 'disabled' : ''" class="interaction">
        <div slot="header">
            {{ props.title }}
        </div>

        <p class="paragraph">
			{{  props.text }}
		</p>

        <div v-if="!props.multiple" class="data-grid" label="Alignment">
            <sl-button  :disabled="!render" size="medium" v-for="(option, index) in props.options" :key="index" @click="() => selectOption(index)"> {{ option }}</sl-button>
        </div>

		<div class="checkbox-container" v-else>
			<sl-checkbox class="checkbox" :disabled="!render" v-for="(option, index) in props.options" :key="index" @sl-change="(event) => selectRadioButton(event, index)"> {{  option }}</sl-checkbox>
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

function selectOption(index: number) {

  if (!render.value)
    return;


  render.value = false;
  props.select(index);
}

function selectRadioButton(event: UIEvent, index: number) {
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

<style lang="less">
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

</style>
