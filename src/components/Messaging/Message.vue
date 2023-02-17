<template>
    <sl-alert v-if="props.duration" :variant="props.variant"
              open
              :duration="props.duration"
              closable>
        <sl-icon slot="icon" :name="props.icon" sprite></sl-icon>
        <div class="bold">{{ headline }} {{ time.toLocaleString() }}</div>
        <slot></slot>
    </sl-alert>

    <sl-alert v-else
              :variant="props.variant"
              style="margin-bottom: 10px"
              open
              closable>
        <sl-icon slot="icon" :name="props.icon" sprite></sl-icon>
        <div class="bold">{{ headline }} {{ time.toLocaleString() }}</div>
        <slot></slot>
    </sl-alert>
</template>

<script setup lang="ts">
//@ts-nocheck
import {defineComponent, onMounted, ref} from "vue";
const props = defineProps({
    icon: String,
    variant: String,
    headline: String,
    duration: Number,
    time: Date
})
</script>

<style scoped lang="less">

.bold{
  font-weight: bold;
}

sl-alert{
  &::part(message){
    padding: var(--sl-spacing-x-small);
  }

  &::part(icon){
    padding: var(--sl-spacing-x-small) var(--sl-spacing-x-small) var(--sl-spacing-x-small) var(--sl-spacing-medium);
  }
}

</style>