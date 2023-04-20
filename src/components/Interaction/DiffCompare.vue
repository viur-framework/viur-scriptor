<template>
  <sl-card class="interaction">
    <div slot="header">
      <template v-if="!props.title">{{ t("diff") }}</template>
      <template v-else>{{ props.title }}</template>
    </div>

    <div class="extended-inter">
      <div v-for="(value, index) in props.values" :key="index">
        <div class="container">
          <div class="child-start">{{ value[0] }}</div>
          <div class="child-end">
            <div class="from">
              {{ value[1] }}
            </div>

            <span class="arrow">&#8594;</span>

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
    title: String;
    values: String[][];
  }

  import { ref } from "vue";
  import { useI18n } from "vue-i18n";

  const render = ref(true);

  const { t } = useI18n();

  const props = defineProps<Props>();
  console.log("values:", props.values);
</script>

<style scoped lang="less">
  .interaction-img {
    margin: -10px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: calc(100% + 20px);
    height: 200px;
    margin-bottom: 20px;
    background-color: var(--sl-color-neutral-100);

    img {
      object-fit: contain;
      height: 100%;
    }
  }

  .container {
    overflow-y: auto;
    display: flex;
    justify-content: space-between;
    gap: 80px;
    align-items: flex-start;
  }

  .extended-inter {
    overflow-y: auto;
    max-height: 400px;
  }

  .diff {
    flex: 1 0 50%;
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
    display: flex;
    flex-direction: row;
    align-items: stretch;
    flex-wrap: nowrap;
    margin-bottom: 10px;
  }

  .child-start {
    display: flex;
    align-items: center;
    order: 0;
    width: 20%;
    padding: 0.4em;
  }

  .child-end {
    order: 1;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 15px;
    background-color: var(--sl-color-neutral-100);
    padding: 0.4em;
    flex: 1;
  }

  .from {
    margin-left: 5px;
    color: var(--sl-color-danger-600);
  }

  .arrow {
    color: var(--sl-color-primary-500);
  }

  .to {
    color: var(--sl-color-success-600);
  }
</style>
