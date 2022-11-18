<template>
	<div class="loading-spinner" ref="spinner" v-show="props.show">
		<sl-spinner style="font-size: 50px; --track-width: 10px;"></sl-spinner>
	</div>
</template>

<script lang="ts">
import {onMounted, ref} from "vue";

export default {
	name: "LoadingSpinner",
	props: {
		show: ref<boolean>(),
		backgroundColor: {
			type: String,
			default: "",
		}
	},
	setup(props) {
		let spinner = ref<HTMLDivElement>();
		onMounted(() => {
			if (props.backgroundColor.length > 0) {
				spinner.value.style.backgroundColor = props.backgroundColor;
			}
		})

		return {props, spinner}
	}
}
</script>

<style scoped>
.loading-spinner {
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
</style>
