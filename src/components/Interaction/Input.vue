<template>

    <sl-card  :class="'card-header'">
        <div slot="header">
            {{ props.title }}
        </div>

        {{  props.text }}

        <div slot="footer">
            
            
            <sl-input v-if="props.type !== 'text'" :type="props.type"></sl-input>
            <sl-textarea v-else class="label-on-left" ></sl-textarea>
            <sl-button variant="success" style="margin-top: 10px;"> {{ t("send") }} </sl-button>
        </div>
    </sl-card>
</template>


<script setup lang="ts">
export interface Props {
    title: String,
    text: String,
    type: String,
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


</style>