<template>

    <sl-card  :class="'card-header'">
        <div slot="header">
            {{ props.title }}
        </div>

        {{  props.text }}
        <div slot="footer" class="container">
            <sl-button variant="success" :class="'accept-button ' + (selectedValue ? 'selected-button' : '')" @click="() => confirm(true)">{{ t('yes') }} </sl-button>
            <sl-button variant="danger" :class="'accept-button ' + (selectedValue ? 'selected-button' : '')" @click="() => confirm(false)">{{ t('no')}}</sl-button>
            <sl-button v-if="props.cancel" variant="neutral" class="accept-button" @click="() => render = false">{{ t('cancel') }} </sl-button>
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
const selectedValue = ref<boolean>(undefined);


const props = defineProps<Props>();

function confirm(state: boolean) {
    if (!render.value)
        return;

    render.value = false; 
    selectedValue.value = state; 
    if (props.select)
        props.select(state); 
}


</script>


<style scoped>
    .disabled {
        
    }
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
    opacity: 1.5;
  }


</style>