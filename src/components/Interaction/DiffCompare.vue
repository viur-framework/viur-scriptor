<template>

    <sl-card class="interaction">
        <div slot="header">
            
            <template v-if="!props.title">{{ t('diff') }}</template>
            <template v-else>{{props.title}}</template>
            
        </div>


      <div class="extended-inter">

      <div v-for="(value, index) in props.values" :key="index">
        <sl-divider v-if="index > 0" style="--width: 4px;"></sl-divider>
       
        <div class="container">
          <div class="child child-start">{{ value[0] }}</div>
          <div class="child child-end">
            <div class="from">
              {{ value[1] }} 
            </div>

            ->

            <div class="to">
              {{ value[2] }}
            </div>
            
          </div>



        </div>

      </div>
    </div>
    </sl-card>
</template>


<script setup lang="ts">
export interface Props {
    title: String,
    values: String[][],
}


import {ref} from 'vue';
import { useI18n } from 'vue-i18n';

const render = ref(true);

const {t} = useI18n();



const props = defineProps<Props>();
  console.log("values:", props.values)

</script>


<style scoped lang="less">
  .extended-inter {
    overflow-y: auto;
    max-height: 400px;
    margin-right: 2px
  }

  #scroll {
    margin-left: 5px;
  }

  .card-header {
    max-width: 300px;
    max-height: 300px;
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

  .diff {
    flex:1 0 50%;
    align-items: flex-start;
  }

  .diff-start {
    display: flex;
    align-self: flex-start; 
  }
  .diff-end {
    display: flex;
    align-self: flex-end; 

  }

.container {
  overflow-y: auto;
  display: flex;
  justify-content: space-between;
  gap: 80px;
  align-items: flex-start;
}

.child {
  padding: 5px;
}

.child-start {
  order: 0;
}

.child-end {
  order: 1;

  display: flex;

  justify-content: space-between;
  gap: 15px;
}

.from {
  margin-left: 5px;
  color: red;
}

.to {
  color: green;
}
</style>
