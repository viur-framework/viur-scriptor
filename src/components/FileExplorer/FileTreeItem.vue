<template>
	<li v-show="canRender" contenteditable="false">
		<div
				class="item-inner">
			<div class="item-inner-wrap"
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
					 ref="titleElement">
					{{ model.label }}
				</div>
			</div>
			  <sl-dropdown class="dropdown-selection" distance="5">
				<sl-icon name="three-dots" slot="trigger"></sl-icon>
				<sl-menu @sl-select="selectMenuItem">

					<sl-menu-item v-if="props.model.rootNode" class="dropdown-item-new" value="reload">
						<sl-icon slot="prefix" library="bootstrap" name="arrow-clockwise"></sl-icon>

						Neuladen

					</sl-menu-item>

					<sl-menu-item v-if="isFolder" class="dropdown-item-new" value="add-directory">
						<sl-icon slot="prefix" name="folder-plus"></sl-icon>

						Ordner hinzufügen
					</sl-menu-item>

					<sl-menu-item v-if="isFolder" class="dropdown-item-new" value="add-file">
						<sl-icon slot="prefix" name="add-file"></sl-icon>

						Datei hinzufügen
					</sl-menu-item>

					<sl-menu-item v-if="!props.model.rootNode" class="dropdown-item-new" value="rename">
						<sl-icon slot="prefix" name="edit-box"></sl-icon>

						Umbenennen

					</sl-menu-item>

					<sl-menu-item v-if="!isFolder" class="dropdown-item-new" value="download">
						<sl-icon slot="prefix" name="download"></sl-icon>

						Herunterladen
					</sl-menu-item>

					<sl-menu-item v-if="!props.model.rootNode" class="dropdown-item-new" value="delete">
						<sl-icon slot="prefix" library="bootstrap" name="trash"></sl-icon>

						Löschen
					</sl-menu-item>


				</sl-menu>
			  </sl-dropdown>
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
import {Request} from '@viur/viur-vue-utils';
import {useDialogStore} from "../../stores/dialogs";
import {useI18n} from "vue-i18n";

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

		const dialogStore = useDialogStore();
		const {t} = useI18n();

		function selectMenuItem(event: UIEvent) {
			let item: SlMenuItem = event.detail.item;

			if (item.value === "download") {
				// Download-File
				Request.view("script", props.model.key, {group:"leaf"}).then(async function(response) {
					const data = (await response.json()).values;
					console.log(data);
					const blob1 = new Blob([data["script"]], { type: "text/plain" });

					const url = window.URL.createObjectURL(blob1);
					const a = document.createElement('a');
					a.style.display = 'none';
					a.href = url;
					// the filename you want
					a.download = data["name"];
					document.body.appendChild(a);
					a.click();
					window.URL.revokeObjectURL(url);
				}).catch((e) => {

				})

			}
			else if (item.value === "rename") {
				/* open a picker */
				// change name

				const path = props.helper.getMyPath(props.model.key);

				dialogStore.open({
					title:t("dialog.change.name." + (isFolder.value ? "directory" : "file") ),
					text:"",
					type:isFolder.value ? "directory" : "file",
					acceptEvent: (text) => props.helper.edit(props.model.key, isFolder.value ? "node" : "leaf", text, ""),
					showInputText: true,
					prefix: path.split("/").length <= 1 ? "" : path,
					buttonText: t("safe"),
					showCancelButton: false,
					initialText: props.model.label,
					regexStringExpression: isFolder.value ? "^[a-zA-Z0-9äöüÄÖÜ_-]*$" : "^[a-zA-Z0-9äöüÄÖÜ_-]+?.py$",
				});


			}
			else if (item.value === "delete") {
				dialogStore.open({
					title:t("dialog.delete.name." + (isFolder.value ? "directory" : "file") ),
					text:t("dialog.delete.file"),
					type:isFolder.value ? "directory" : "file",
					acceptEvent: (text) => props.helper.remove(props.model.key),
					showInputText: false,
					prefix: props.helper.getPath(props.model.key, true),
					buttonText: t("delete"),
					showCancelButton: false,
				});
			}
			else if (item.value === "add-file") {
				dialogStore.open({
					title:t("dialog.create.name.file"),
					text:"",
					type:"file",
					acceptEvent: (text) => props.helper.add(props.model.key, "leaf", text, ""),
					showInputText: true,
					prefix: props.helper.getPath(props.model.key, false),
					buttonText: t("create"),
					showCancelButton: false,
					regexStringExpression: "^[a-zA-Z0-9äöüÄÖÜ_-]+?.py$",
				});
			}
			else if (item.value === "add-directory") {
				dialogStore.open({
					title:t("dialog.create.name.directory"),
					text:"",
					type:"directory",
					acceptEvent: (text) => props.helper.add(props.model.key, "node", text, ""),
					showInputText: true,
					prefix: props.helper.getPath(props.model.key, false),
					buttonText: t("create"),
					showCancelButton: false,
					regexStringExpression: "^[a-zA-Z0-9äöüÄÖÜ_-]*$",
				});
			}
			else if (item.value === "reload") {
				dialogStore.open({
					title:t("dialog.reload" ),
					text:t("dialog.reload.description"),
					type:isFolder.value ? "directory" : "file",
					acceptEvent: (text) => props.helper.reload(),
					showInputText: false,
					prefix: "",
					buttonText: t("reload"),
					showCancelButton: false,
				});
			}
			console.log(item.value);
		}


		return {props, element, toggle, isFolder, dragStart, onDrop, click, titleElement, isOpen:computed(function(){
				return props.model.state.isOpen;
			}),
      canRender, selectMenuItem}
	}
}





</script>


<style lang="less" scoped>

.fileTree{
  width: 100%;
  padding-left: 1em;
  margin: 0;
  list-style: none;
}

.title{
  display: inline-block;
  padding: .2em;
  transition: all ease .3s;
  font-size: .95em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-inner{
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  padding: .2em;
  cursor: pointer;
  width: 100%;

  &:hover{
	background-color: var(--sl-color-neutral-100);

	.dropdown-selection{
	  &::part(trigger){
		opacity: 1;
	  }
	}
  }
}

.item-inner-wrap{
  display: flex;
  flex-direction: row;
  align-items: center;
  width: calc(100% - 1em);
}

.selected-file {
  color: @mainColor;
  font-weight: bold;

  sl-icon{
  	color: @mainColor;
  }
}

.icon{
  flex: 0 0 1em;
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
  flex: 0 0 1em;
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

.dropdown-selection{

  sl-menu{
	padding: 0;
  }

  &::part(trigger){
	opacity: 0;
	transition: all ease .3s;
	display: flex;
	align-items: center;
	justify-content: center;
  }

}

.dropdown-item-new {
  &::part(label){
	margin-left: 0.1em;
	margin-top: 0.2em;
  }

  &::part(checked-icon) {
	display: none;
  }

  &::part(base){
	transition: all ease .3s;

	&:hover{
	  background-color: @mainColor;
	}
  }
}

.dropdown-item{
	&::part(label){
	  font-size: .9em;
	  margin: 0 -1em;
	}

	&::part(suffix){
	  display: none;
	}

	&::part(prefix){
	  display: none;
	}

  	&::part(base){
	  transition: all ease .3s;

	  &:hover{
		background-color: @mainColor;
	  }
	}
}

</style>
