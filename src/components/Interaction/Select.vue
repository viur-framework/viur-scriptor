<template>
    <sl-card :disabled="!render" :class="!render ? 'disabled' : ''" class="card-header">
        <div slot="header">
            {{ props.title }}
        </div>

        {{ props.text }}
        <br>
        <br>


        <div v-if="!props.multiple" class="data-grid" label="Alignment">
            <sl-button  :disabled="!render" size="medium" v-for="(option, index) in props.options" :key="index" @click="() => selectOption(index)"> {{ option }}</sl-button>
        </div>

        <div v-else>
            <div class="checkbox-container">
                <sl-checkbox class="checkbox" :disabled="!render" v-for="(option, index) in props.options" :key="index" @sl-change="(event) => selectRadioButton(event, index)"> {{  option }}</sl-checkbox>
            </div>
            <sl-button variant="success" v-show="render" style="margin-top: 10px;" @click="send"> {{ t("send") }} </sl-button>

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

<style>
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
    width: 100%;
    display: flex;
    flex-wrap: wrap;
  }

  .checkbox {
    width: 25%; 
    margin-top: 5px;
    margin-bottom: 5px;
    margin-left: 5px;
  }

  .data-grid {
    display: grid; 
    overflow-x: auto; 
    grid-template-columns: repeat(4, 1fr);
    justify-content: space-between;
    grid-gap: 5px;
    overflow-y: auto; 
    overflow-x: auto;
    }

</style>