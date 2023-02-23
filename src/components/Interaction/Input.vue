<template>

    <sl-card  :class="'card-header'">
        <div slot="header">
            {{ props.title }}
        </div>

        {{  props.text }}

        <div slot="footer">
            
            <sl-alert v-if="error.length > 0" variant="danger" open> {{ error }}</sl-alert><br>
            <sl-input v-if="props.type !== 'text'" :type="props.type + (props.useTime ? 'time-local' : '')" v-model="value" :readonly="!render"></sl-input>
            <sl-textarea v-else class="label-on-left" v-model="value" :readonly="!render"></sl-textarea>
            <sl-button v-show="render" variant="success" style="margin-top: 10px;" @click="send"> {{ t("send") }} </sl-button>
        </div>
    </sl-card>
</template>


<script setup lang="ts">
export interface Props {
    title: String,
    text: String,
    type: String,
    select: Function,
    empty: Boolean,
    useTime: Boolean
}


import {ref, watch} from 'vue'; 
import { useI18n } from 'vue-i18n';

const render = ref(true); 
const {t} = useI18n();
const selectedValue = ref<boolean>(undefined);
const value = ref<String>(""); 

const error = ref<String>(""); 


const props = defineProps<Props>();

watch(value, (oldValue, newValue) => {
    if (value.value) {
        error.value = ""; 
    }
}); 

function send() {
    if (!render.value)
        return;

    if (!props.empty) {
        if (!value.value) {
            error.value = t("error.empty");
            return;
        }
    }

    let tmpValue = value.value; 
    if (props.type === "date") {
        tmpValue = new Date(value.value).valueOf();
    }

    props.select(tmpValue);
    render.value = false; 
   
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