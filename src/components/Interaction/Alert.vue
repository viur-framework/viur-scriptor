<template>

    <sl-card class="interaction">

		<div class="interaction-img">
			<img src="https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80&sat=-100&bri=-5"
			class="">
		</div>

        <div slot="header">
            {{ t('alert') }}
        </div>

		<p class="paragraph">
			{{ props.text }}
		</p>

        <sl-button :disabled="!render"
				   variant="success"
				   size="small"
				   class="accept-button"
				   slot="footer"
				   @click="hide" style="align-items: center;">OK</sl-button>
    </sl-card>
</template>


<script setup lang="ts">
export interface Props {
    text: String,
    accept: Function
}

import {ref} from 'vue';
import { useI18n } from 'vue-i18n';

const render = ref(true);

const {t} = useI18n();



const props = defineProps<Props>();

function hide() {
    if (!render.value)
        return;

    render.value = false;
    if (props.accept)
        props.accept();
}
</script>


<style scoped lang="less">

.interaction-img{
  margin: -10px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: calc(100% + 20px);
  height: 200px;
  margin-bottom: 20px;
  background-color: var(--sl-color-neutral-100);

  img{
	object-fit: contain;
	height: 100%;
  }
}
</style>
