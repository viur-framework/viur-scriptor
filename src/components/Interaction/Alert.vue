<template>
  <sl-card class="interaction">
      <div v-if="imageURL" class="interaction-img">
          <img :src="imageURL" class="">
      </div>



    <div slot="header">
      {{ t("alert") }}
    </div>

    <p class="paragraph">
      {{ props.text }}
    </p>

    <sl-button
      :disabled="!props.entry.render"
      variant="success"
      size="small"
      class="accept-button"
      slot="footer"
      @click="hide"
      style="align-items: center"
      >OK</sl-button
    >
  </sl-card>
</template>

<script setup lang="ts">
  export interface Props {
    text: String;
    accept: Function;
    imageURL: String; 
    entry: {},
  }


  import { ref } from "vue";
  import { useI18n } from "vue-i18n";

  const render = ref(true);

  const { t } = useI18n();

  const props = defineProps<Props>();
    console.log("imageURL: ", props.imageURL); 


  function hide() {
    if (!props.entry.render) return;

    props.entry.render = false;
    if (props.accept) props.accept();
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
</style>
