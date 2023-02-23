<template>

    <sl-card class="card-header">
        <div slot="header">
            {{ t('alert') }}
        </div>

        <div class="big-text">
          {{ props.text }}
        </div>

        <br v-if="render"><br>

        <sl-button :disabled="!render" variant="danger" class="accept-button" @click="hide" style="align-items: center;">OK</sl-button>
    </sl-card>
</template>


<script setup lang="ts">
export interface Props {
    text: String,
    accept: Function
}

import {ref} from 'vue'; 
import { useI18n } from 'vue-i18n';

const render = ref(true); 

const {t} = useI18n(); 



const props = defineProps<Props>();

function hide() {
    if (!render.value)
        return;

    render.value = false; 
    if (props.accept)
        props.accept(); 
}
</script>


<style>
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

  .big-text {
    font-size: 1.4em; 
  }

</style>