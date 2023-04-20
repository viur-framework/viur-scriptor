<template>
  <sl-card :class="'interaction'">
    <div slot="header">
      {{ props.title }}
    </div>

    <p class="paragraph">
      {{ props.text }}
    </p>

    <div slot="footer" class="container">
      <sl-button
        :disabled="!render"
        size="small"
        variant="danger"
        :class="
          'accept-button ' +
          (selectedValue != 0 && selectedValue !== undefined
            ? 'selected-button'
            : '')
        "
        @click="() => confirm(0)"
        >{{ t("no") }}</sl-button
      >
      <sl-button
        :disabled="!render"
        size="small"
        v-if="props.cancel"
        variant="neutral"
        :class="
          'accept-button ' +
          (selectedValue != -1 && selectedValue !== undefined
            ? 'selected-button'
            : '')
        "
        @click="() => confirm(-1)"
        >{{ t("cancel") }}
      </sl-button>
      <sl-button
        :disabled="!render"
        size="small"
        variant="success"
        :class="
          'accept-button ' +
          (selectedValue != 1 && selectedValue !== undefined
            ? 'selected-button'
            : '')
        "
        @click="() => confirm(1)"
        >{{ t("yes") }}
      </sl-button>
    </div>
  </sl-card>
</template>

<script setup lang="ts">
  export interface Props {
    title: String;
    text: String;
    select: Function;
    cancel: Boolean;
  }

  import { ref } from "vue";
  import { useI18n } from "vue-i18n";

  const render = ref(true);
  const { t } = useI18n();
  const selectedValue = ref<number>(undefined);

  const props = defineProps<Props>();

  function confirm(state: number) {
    if (!render.value) return;

    render.value = false;
    selectedValue.value = state;
    if (props.select) props.select(state);
  }
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
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
</style>
