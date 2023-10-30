<script setup>
	import {onMounted, ref} from 'vue';
	import {useI18n} from "vue-i18n";
	import VueJsonPretty from "vue-json-pretty";

	const props = defineProps({
	  title: String,
	  content: String
	})

	const {t} = useI18n();

	const dialogRef = ref();

	onMounted(function (){
		dialogRef.value.show();
	})
</script>

<template>
	<div class="loading foreground">
		<sl-dialog class="dialog-custom dialog-deny-close" :label="t('network.error')" ref="dialogRef" @sl-request-close="(event) => event.preventDefault()">
			<sl-alert variant="danger" open>
			  <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
			  <strong> {{ props.title }}</strong><br />
			</sl-alert>

			<sl-card style="margin-top:10px;">
				<vue-json-pretty :data="props.content" :deep="1" :showDoubleQuotes="true" :showIcon="false" :showLine="false" :collapsedOnClickBrackets="false"/>
			</sl-card>
		</sl-dialog>
	</div>
</template>

<style scoped lang="less">
.loading {
	display: flex;
	justify-content: center;
	align-items: center;
	position: fixed;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 9999;
}
.foreground {
	background-color: rgba(255, 255, 255, 0.6); /* Background color with alpha (transparency) */
	padding: 20px;
	border-radius: 10px;
	backdrop-filter: blur(0.5px); /* Apply a blur effect to the background */
}

.dialog-custom {
}

</style>
