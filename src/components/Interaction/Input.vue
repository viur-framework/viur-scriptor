<template>
  <sl-card :class="'interaction'">
    <div slot="header">
      {{ props.title }}
    </div>

    <p class="paragraph">
      {{ props.text }}
    </p>

    <sl-alert
      v-if="error.length > 0"
      variant="danger"
      open
      class="error-message"
    >
      {{ error }}</sl-alert
    >

    <sl-input
      v-if="props.type !== 'text'"
      :type="props.type + (props.useTime ? 'time-local' : '')"
      v-model="value"
      :readonly="!render"
      @keypress.enter="send"
    ></sl-input>
    <sl-textarea
      v-else
      class="label-on-left"
      v-model="value"
      :readonly="!render"
      @keypress.enter="send"
    ></sl-textarea>

    <div slot="footer">
      <sl-button size="small" v-show="render" variant="success" @click="send">
        {{ t("send") }}
      </sl-button>
    </div>
  </sl-card>
</template>

<script setup lang="ts">
  export interface Props {
    title: String;
    text: String;
    type: String;
    select: Function;
    empty: Boolean;
    useTime: Boolean;
  }

  import { ref, watch } from "vue";
  import { useI18n } from "vue-i18n";

  const render = ref(true);
  const { t } = useI18n();
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
    if (!render.value) return;

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

  .error-message {
    margin-bottom: 15px;
  }
</style>
