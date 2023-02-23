<template>

    <sl-card  :class="'card-header'">
        <div slot="header">
            {{ props.title }}
        </div>

        {{  props.text }}
        <div slot="footer" class="container">
            <sl-button :disabled="!render" variant="success" :class="'accept-button ' + ((selectedValue != 1 && selectedValue !== undefined) ? 'selected-button' : '')" @click="() => confirm(1)">{{ t('yes') }} </sl-button>
            <sl-button :disabled="!render" variant="danger" :class="'accept-button ' + ((selectedValue != 0 && selectedValue !== undefined) ? 'selected-button' : '')" @click="() => confirm(0)">{{ t('no')}}</sl-button>
            <sl-button :disabled="!render" v-if="props.cancel" variant="neutral" :class="'accept-button ' + ((selectedValue != 0 && selectedValue !== undefined) ? 'selected-button' : '')" @click="() => confirm(-1)">{{ t('cancel') }} </sl-button>
        </div>
    </sl-card>
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


<style scoped>
.card-header {
    max-width: 300px;
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

  .container {
    display: grid; 
    grid-auto-flow: column;
    grid-gap: 0.8em;
  }

  .selected-button {
    opacity: 0.3;
    
  }


</style>