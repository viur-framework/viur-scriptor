<template>

    <sl-card :disabled="!render" :class="!render ? 'disabled' : ''" class="card-header">
        <div slot="header">
            {{ props.text }}
        </div>

        <sl-button variant="danger" class="accept-button" @click="hide">OK</sl-button>
    </sl-card>
</template>


<script setup lang="ts">
export interface Props {
    text: String,
    accept: Function
}

import {ref} from 'vue'; 

const render = ref(true); 



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
  .disabled {
    opacity: 0.5;
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

</style>