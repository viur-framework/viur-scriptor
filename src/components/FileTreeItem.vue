<template>


	<li v-show="canRender" contenteditable="false">

		<div
				class="title"
				@click="click"
				ref="element"
		draggable="true"
		@dragstart="dragStart"
		@drop="onDrop">
			<sl-icon name="chevron-right" v-if="isFolder" class="arrow" @click="toggle" :class="{ isOpen: props.model.state.isOpen }"></sl-icon>
			<div class="spacer" v-else></div>
			<sl-icon class="icon" name="folder" v-if="isFolder"></sl-icon>
			<sl-icon class="icon" name="file" v-else></sl-icon>

			<div class="title"
				 ref="titleElement"
			>{{ model.label }}</div>
		</div>
		<ul v-show="props.model.state.isOpen" v-if="isFolder" class="fileTree">
			<!--
			  A component can recursively render itself using its
			  "name" option (inferred from filename if using SFC)
			-->
			<FileTreeItem
					class="item"
					v-for="model in model.children"
					:model="model"
					:onselect="onselect"
					:elements="props.elements"
					:helper="helper">
			</FileTreeItem>
		</ul>
	</li>
</template>


<script lang="ts">
import {ref, computed, defineProps, onMounted, watch, onBeforeMount} from 'vue'
import {SlIcon} from "@viur/viur-shoelace";

export default {
	name: "LoadingSpinner",
	props: {
		model: Object,
		onselect: Function,
		helper: Object,
		elements: Object
	},
	setup(props) {
		const isOpen = ref(false)
		const element = ref<HTMLDivElement>()
		const titleElement = ref<HTMLDivElement>()
		const isFolder = computed(() => {
			return props.model.parent
		})

    const canRender = computed(() => {
      return props.model.renderElement
    })

    console.log("mymodel", props.model)

		function toggle(event: UIEvent) {
			console.log("Toggle!!");
			if (props.model.parent) {
				// eslint-disable-next-line vue/no-mutating-props
				props.model.state.toggle();
			//	isOpen.value = !isOpen.value
				//localStorage.getItem("scriptor_leaf_open_" + , )
			}
		}

		function click(event: UIEvent) {
			console.log("detail:", event.detail)
			if(event.detail === 1) {


				props.onselect(element.value, props.model.key)
			}
			else if (event.detail === 2){
				toggle(event);
			}
		}

		function dragStart(event) {
			event.dataTransfer.dropEffect = 'move'
			event.dataTransfer.effectAllowed = 'move'
			event.dataTransfer.setData('key', props.model.key);
			console.log("key: ", props.model.key)
		}

		function onDrop(event) {
			const key = event.dataTransfer.getData('key')
			if (key !== props.model.key)
			{
				props.helper.move(props.model.key, key);
				console.log("recv key", key);
			}
		}
		console.log("props.model:", props.model)


		function update() {
			if (props.model.parent) {
				//	console.log("is parent", props.model.parent)

				element.value.ondragover = (event) => {
					event.preventDefault();
				}
				element.value.ondragenter = (event) => {
					event.preventDefault();
				}
			}
		}

		onMounted(() => {
			update();

			props.elements.set(props.model.key, element);
		});

		watch(() => element.value, (first, second) => {
			props.elements.set(props.model.key, element);
		});

		watch(() => props.model.key, (first, second) => {
			props.elements.set(props.model.key, element);
		});

		watch(() => props.model, (first, second) => {
			update();

		});

		watch(() => props.model.parent, (first, second) => {
			if (props.model.parent) {
				console.log("Before Mount: !!!")
				props.model.state.init();
			}
		});

		onBeforeMount(function(){
			if (props.model.parent) {
				console.log("Before Mount: !!!")
				if (props.model.state) {
					props.model.state.init();
				}
			}
		})


		return {props, element, toggle, isFolder, dragStart, onDrop, click, titleElement, isOpen:computed(function(){
				return props.model.state.isOpen;
			}),
      canRender}
	}
}





</script>


<style lang="less" scoped>

.fileTree{
  width: 100%;
  height: 100%;
  padding-left: 1em;
  margin: 0;
  list-style: none;
}

.title{
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  padding: .2em;
  transition: all ease .3s;
  cursor: pointer;
  font-size: .95em;

  &:hover{
	background-color: var(--sl-color-neutral-100);
  }

}

.selected-file {
  color: @mainColor;
  font-weight: bold;

  sl-icon{
  	color: @mainColor;
  }
}

.icon{
  margin-right: .5em;
  color: var(--sl-color-neutral-600);
}

.arrow{
  font-size: .65em;
  width: 1em;
  margin-right: .5em;
  transition: all ease .3s;
  color: var(--sl-color-neutral-400);

  &.isOpen{
	transform: rotate(90deg);
  }
}

.spacer{
  width: 1em;
}

.textarea {
  -moz-appearance: textfield-multiline;
  -webkit-appearance: textarea;
  border: 0.5px solid gray;
  overflow: auto;
  padding: 2px;
}


[contenteditable="true"] {
  color: var(--sl-color-neutral-400);
}

[contenteditable="true"]:active, [contenteditable="true"]:focus
{

  outline:none;
}


</style>
