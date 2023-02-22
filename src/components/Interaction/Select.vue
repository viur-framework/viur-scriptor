<template>
    <sl-card :disabled="!render" :class="!render ? 'disabled' : ''" class="card-header">
        <div slot="header">
            {{ props.title }}
        </div>

        {{ props.text }}
        <br>
        <br>


        <div v-if="!props.multiple" class="data-grid" label="Alignment">
            <sl-button  size="medium" v-for="option in props.options"> {{ option }}</sl-button>
        </div>

        <div v-else>
            <div class="checkbox-container">
                <sl-checkbox class="checkbox" v-for="option in props.options"> {{  option }}</sl-checkbox>
            </div>
            <sl-button variant="success" style="margin-top: 10px;"> {{ t("send") }} </sl-button>

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
}

const render = ref(true); 
const props = defineProps<Props>();
const {t} = useI18n(); 


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
    grid-template-columns: repeat(3, 1fr);
    justify-content: space-between;
    grid-gap: 5px;
    overflow-y: scroll; 
    overflow-x: scroll;
    }

</style>