<template>
	<div class="header">
		<sl-tooltip content="Add new directory">
			<sl-button variant="success" @click="(event) => addEntry(event, 'node')">
				<sl-icon name="folder-plus"></sl-icon>
			</sl-button>
		</sl-tooltip>
		<sl-tooltip content="Add new file">
			<sl-button variant="success" @click="(event) => addEntry(event, 'leaf')">
				<sl-icon name="add-file"></sl-icon>
			</sl-button>
		</sl-tooltip>

		<sl-tooltip content="Change name">
			<sl-button variant="neutral"  @click="editEntry">
				<sl-icon name="edit-box"></sl-icon>
			</sl-button>
		</sl-tooltip>

		<sl-tooltip content="Delete">
			<sl-button variant="danger" @click="removeEntry">
				<sl-icon library="bootstrap" name="trash"></sl-icon>
			</sl-button>
		</sl-tooltip>

		<div class="spacer"></div>

		<sl-tooltip content="Reload">
			<sl-button class="last-button" variant="primary" @click="helper.reload">
				<sl-icon library="bootstrap" name="arrow-clockwise"></sl-icon>
			</sl-button>
		</sl-tooltip>
	</div>

	<sl-dialog :ref="dialog.instance" :label="dialog.title.value" class="dialog-deny-close">

		<div>
		{{  dialog.text.value }}



			<div class="new-folder" v-if="dialog.showInput.value">

				<sl-icon library="bootstrap" :name="dialog.type.value === 'directory' ? 'folder' : 'file-earmark'">

				</sl-icon>

				<div :class="dialog.inputTextColor.value">
					{{dialog.inputPath.value}}
				</div>
			</div>
		</div>


		<sl-input  :ref="dialog.inputInstance" v-show="dialog.showInput.value" :value="dialog.inputText.value" @input="(event: UIEvent) => dialog.inputText.value = event.target.value"></sl-input>
		<sl-alert>wdw</sl-alert>
		<sl-button slot="footer" variant="danger" @click="(event) => dialog.instance.value.hide()">Cancel</sl-button>
		<sl-button slot="footer" variant="success" @click="dialog.accept">{{ dialog.buttonText.value }}</sl-button>
	</sl-dialog>

	<ul class="fileTree">
		<FileTreeItem class="item" :model="tree.data.value" :onselect="tree.selectItem" :helper="helper" :elements="tree.elements"></FileTreeItem>
	</ul>

	<div class="loading-spinner" v-show="isLoading || pythonStore.isLoading">
		<sl-spinner class="vld-overlay"></sl-spinner>
	</div>

</template>

<script lang="ts">
import {computed, onBeforeMount, onMounted, ref, watch, watchEffect} from "vue";
import {Request} from "@viur/viur-vue-utils";

import FileTreeItem from "./FileTreeItem.vue";
import {SlDialog, SlIcon, SlInput, SlMenu, SlButton} from "@viur/viur-shoelace";
import LoadingSpinner from "./common/LoadingSpinner.vue";
import PythonExecutor from "./PythonExecutor.vue";

import {usePythonStore} from "../stores/PythonStore";
import { useTabStore } from '@/stores/TabStore';

export default {
	name: "FileTree",
	components: {FileTreeItem, LoadingSpinner},
	props: {
		onSelectItem: Function,
		manager: Object,
	},

	setup(props){

		let pythonStore = usePythonStore();
		let tabStore = useTabStore(); 

		let isLoading = ref<boolean>(false);
		let dialog = {
			instance: ref<SlDialog>(),
			inputTextColor: ref(""),
			text: ref(""),
			title: ref(""),
			type: ref(""),
			mode: ref(""),
			buttonText: ref(""),
			showInput: ref<boolean>(false),
			inputText: ref<string>(""),
			inputInstance: ref<SlInput>(),
			inputPath: computed(function(){
				let path = "";
				if (tree.selectedItem.value) {
					let element = tree.find(tree.selectedItem.value);
					if (element) {
						let parent = element.parentObject;

						if (dialog.mode.value === "add") {
							if (element.parent)
								parent = element;
						}

						let parents = [];
						while (parent) {
							if (parent.rootNode)
								break;

							parents.push(parent);

							parent = parent.parentObject;
						}

						parents.reverse();
						for (let i in parents) {
							path += parents[i].label + "/";
						}


					}
					path += dialog.inputText.value;
				}
				return path;
			}),
			callback: function() {},
			accept: function() {
				console.log("accept!");
				if (dialog.callback !== undefined)
					dialog.callback();

				dialog.instance.value.hide();
			},

			reset: function(){
				dialog.inputTextColor.value = "";
				dialog.text.value = "";
				dialog.title.value = "";
				dialog.type.value = "";
				dialog.showInput.value = false;
				dialog.inputText.value = "";
				dialog.mode.value = "add";
				dialog.buttonText.value = "Add";
			}
		}
		let rootNodeElement = ref<FileTreeItem>();


		let tree = {
			// Tree structure
			data: ref({
				label: "/",
				children: [],
				parent: true,
				key: "",
				plugin: false,
				rootNode: true,
				state: {
					isOpen: ref<boolean>(true),
					init: function () {

					},
					open: function() {
						//tree.data.value.state.isOpen.value = true;
					},
					close: function (){
						//tree.data.value.state.isOpen.value = false;

					},
					toggle: function (){
						//tree.data.value.state.isOpen.value = !tree.data.value.state.isOpen.value;
					}
				},
        renderElement: true,
			}),

			// The selected item (in the tree)
			// USing keys
			selectedItem: ref(""),
			selectedFile: ref(""),

			elements: {
				data: ref({}),
				set: function(key: string, element: HTMLDivElement){
					console.log("key", key, " setting to ", element)
					if (key.length <= 0)
						return;

					tree.elements.data.value[key] = element;
				},
				get: function (key: string){
					return tree.elements.data.value[key];
				}
			},

      search: function(text: string, children = tree.data.value.children){

        let showList = [];
        for (let child in children) {
          console.log(children[child].renderElement)
          if (text) {
            console.log("label:", children[child].label, "includes: ", children[child].label.includes(text))
            children[child].renderElement = children[child].label.includes(text);
            if (children[child].renderElement)
              showList.push(children[child].parentObject)
          }
          else {
            children[child].renderElement = true;
          }

          if (children[child].children && children[child].children.length > 0)
            tree.search(text, children[child].children);
        }

        for (let index in showList) {
          let element = showList[index];
          element.renderElement = true;
          while (element)
          {
            element.renderElement = true;
            element = element.parentObject;
          }
        }
      },


			// helper functions for sorting
			comperator: function(a, b){
				if (a.plugin && !b.plugin)
					return -1;

				if (a.parent === b.parent)
					return 0;

				if (a.parent && !b.parent)
					return -1;

				return 1;
			},

			// Sorting (order: 1.directory, 2.files) recursively
			sort: function(children = tree.data.value.children) {
				children.sort(tree.comperator);

				for (let child in children) {
					if (children[child].children && children[child].children.length > 0)
						tree.sort(children[child].children);
				}

				console.log("sortTree", tree.data.value)
			},

			// Helper to find a children by the key in the tree
			findChildrenByKey: function(key: string, children = tree.data.value.children) {
				for (let child in children) {
					if (children[child].children && children[child].children.length > 0) {
						let obj = tree.findChildrenByKey(key, children[child].children);
						if (obj !== null)
							return obj;
					}

					if (children[child].key === key){
						return children[child];
					}
				}
				return null;
			},

			// Check if a label is existing
			isExistingLabel: function(name: string, children = tree.data.value.children){
				for (let child in children) {
					if (children[child].label === name)
						return true;
				}

				return false;
			},

			// Get
			getChildrenByLabel: function(name: string, children = tree.data.value.children){
				for (let child in children) {
					if (children[child].label === name)
						return children[child];
				}

				return null;
			},

			// Finds a children by the key and also includes the rootNode
			find: function(key: string, children = tree.data.value.children){
				if (tree.data.value.key == key)
					return tree.data.value;
				return tree.findChildrenByKey(key, children);
			},

			getPath: function (key: string, withOwnLabel: boolean = false) {
				let element = tree.find(key);
				if (element) {
					let parent = element.parentObject;
					if (element.parent)
						parent = element;

					let parents = [];
					while (parent) {
						if (parent.rootNode)
							break;

						parents.push(parent);

						parent = parent.parentObject;
					}

					parents.reverse();
					let path = "";

					for (let i in parents) {
						path += parents[i].label + "/";
					}

					if (withOwnLabel)
						path += element.label;

					return path;
				}

				return null;
			},

			isPluginItem: function (key: string) {
				let element = tree.find(key);
				if (element) {
					let parent = element.parentObject;

					while (parent) {
						if (parent.rootNode)
							break;


						if (parent.plugin)
							return true;

						parent = parent.parentObject;
					}
				}

				return false;
			},

			forEachChildren: async function (key: string, func: Function) {
				let element = tree.find(key);
				if (element) {
					if (element.children && element.children.length > 0) {
						for (let i in element.children.length) {
							let child = element.children[i];
							if (child) {
								await func(child);

								if (child.children.length > 0)
									await tree.forEachChildren(child.key, func);
							}
						}
					}
				}
			},

			renameLabel: function (key: string, name: string) {
				let element = tree.find(key);
				if (!element)
					return;

				element.label = name;
			},

			addChildren: function(parentKey: string, key: string, label: string, type: string){
				let parent = tree.find(parentKey);
				if (parent) {
					let new_children = {
						key: key,

						label: label,
						parent: type === 'node',
						children: [],
						parentObject: parent,
						rootNode: false,
						plugin: false,
						state: {
							isOpen: ref<boolean>(),
							init: function () {
								new_children.state.isOpen.value = localStorage.getItem(`children.${parent.key}.open`) == "1";
							},
							open: function() {
								new_children.state.isOpen.value = true;
								localStorage.setItem(`children.${parent.key}.open`, "1");

							},
							close: function (){
								new_children.state.isOpen.value = false;
								localStorage.setItem(`children.${parent.key}.open`, "0");

							},
							toggle: function (){
								new_children.state.isOpen.value = !new_children.state.isOpen.value;

								localStorage.setItem(`children.${parent.key}.open`, new_children.state.isOpen.value ? "1" : "0");
							}
						},
            renderElement: true,
					}
					if (!parent.state.isOpen.value)
						parent.state.open();

					parent.children.push(new_children);
					parent.children.sort(tree.comperator);
				}
			},

			// Removes recursively the key
			removeByKey: function(key: string, children = tree.data.value.children) {
				let element = this.find(key);

				if (!element)
					return;

				const index = children.indexOf(element);
				if (index > -1)
				{
					children.splice(index, 1);
					return true;
				}
				else {
					for (let e in children) {
						if (children[e].children && children[e].children.length > 0) {
							if (tree.removeByKey(key, children[e].children))
								return true;
						}
					}
				}

				return false;
			},

			clearStorageByKey: function (key: string) {
				let element = tree.find(key);
				if (element) {
					const _key = `children.${key}.open`;
					if (localStorage.getItem(_key))
						localStorage.removeItem(_key);

					if (element.children && element.children.length > 0) {
						for (let i in element.children) {
							let _child = element.children[i];
							tree.clearStorageByKey(_child.key);
						}
					}
				}

			},

			delete: function(key: string) {
				tree.clearStorageByKey(key);
				tree.removeByKey(key);

				// eslint-disable-next-line vue/no-mutating-props
				//props.unsaved = false;
			},

			// Select a item from children (left click)
			selectItem: function(element: HTMLDivElement, key: string, skipSave: boolean = false, callback: Function = null) {
				if (tree.selectedItem.value == key)
					return;

				console.log("Select ", element, " key", key)

				let _entry = tree.find(key);
				if (_entry === null) {
					console.log(tree.data.value, " value ", key)
					console.error("Cannot find element ", element, " key", key)
					return;
				}

				if (!_entry.parent){

					if (tree.selectedFile.value === key) {
						tree.selectedItem.value = key;
						tree.selectedFile.value = key;
						return;
					}

					/*
					if (props.manager.isUnsaved()) {

						dialog.reset();

						dialog.instance.value.show();
						dialog.title.value = `Do you wanna safe your changes?`;
            dialog.buttonText.value = "Save";


            dialog.callback = function() {
							//helper.saveCode(props.executor.getCode(), function(){
							//	tree.selectItem(element, key);

							//});

							
						}
						return;
					}*/
				}
				tree.selectedItem.value = key;
				if (!skipSave)
					localStorage.setItem(`selected.item.key`, key);

				console.log("Select ", element, " key", key)

				if (!_entry.parent) {
					isLoading.value = true;
					Request.view("script", key, {group: "leaf"}).then((answ: Response) => {
						answ.json().then(function (res) {
							if (props.onSelectItem)
								props.onSelectItem();


							tree.selectedItem.value = key;
							tree.selectedFile.value = key;
							if (!skipSave) {
								localStorage.setItem(`selected.item.key`, key);
								localStorage.setItem(`selected.file.key`, key);
							}
							props.manager.showMirror();

							console.log("view", res);
							//console.log("xxx", props.executor);
							//props.executor.onchange(res.values.script);

							/*if (props.executor.mirror) {
								console.log("update text to", res.values.script);

								//props.executor.mirror.updateText(res.values.script);
							}*/

							//console.log(res.value.script)

							tabStore.addTab(key, res.values.name, res.values.script);


							console.log("tabStore.tabMap", tabStore.tabMap); 

							isLoading.value = false;

							if (callback)
								callback();

						});
					})
				}


				console.log("selectedItem", tree.selectedItem, "element", element);
			},

			create: async function () {
				const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
				async function perform() {

					let createParents = function(parents: any){
						let iter = tree.data.value;

						for (let i in parents) {
							let parent = parents[i];
							if (!tree.isExistingLabel(parent.name, iter.children)) {
								console.log("Creating Parent with plugin: ", parent.name,  " plugin state:", parent.plugin)
								let new_children = {
									label: parent.name,
									key: parent.key,
									parent: true,
									children: [],
									parentObject: iter,
									plugin: parent.plugin,
									rootNode: false,
									state: {
										isOpen: ref<boolean>(),
										init: function () {
											new_children.state.isOpen.value = localStorage.getItem(`children.${parent.key}.open`) == "1";
										},
										open: function () {
											new_children.state.isOpen.value = true;
											localStorage.setItem(`children.${parent.key}.open`, "1");

										},
										close: function () {
											new_children.state.isOpen.value = false;
											localStorage.setItem(`children.${parent.key}.open`, "0");

										},
										toggle: function () {
											new_children.state.isOpen.value = !new_children.state.isOpen.value;

											localStorage.setItem(`children.${parent.key}.open`, new_children.state.isOpen.value ? "1" : "0");
										}

									},
                  renderElement: true,

                }


								console.log("parents:", parents, "Abc children: ", new_children)
								iter.children.push(new_children);
								iter = new_children;
							} else {
								let children = iter.children;
								iter = tree.getChildrenByLabel(parent.name, children);

								console.log("iter is ", iter)
							}
						}

						return iter;
					}

					await Request.get("/json/script/listRootNodes").then(async (answer: Response) => {
						let res = await answer.json();
						let rootNode = res[0];
						console.log("rootNode", res);
						tree.data.value.key = rootNode.key;

						async function create() {

							// Downloading root-node leafs
							{
								let resp = await Request.list("script", {
									group: "leaf",
									dataObj: {
										parententry: rootNode.key
									}
								});

								const data = await resp.json();
								console.log("abc!!!", data);

								for (let index in data["skellist"]) {
									const skel: any = data["skellist"][index];
									console.log("SKel data!!!", skel);

									tree.data.value.children.push({
										label: skel.name,
										key: skel.key,
										parentObject: tree.data.value,
                    renderElement: true,

                  });
								}
							}

							{
								let resp = await Request.list("script", {
									group: "node",
									dataObj: {
										parententry: rootNode.key
									}
								});
								let res = await resp.json();


								for (let index in res["skellist"]) {
									let entry = res["skellist"][index];
									console.log("wdwdwdwdw:", entry)

									let resolveChildrenLeaf = async function (parents = [], parentkey) {
										let resp_leaf = await Request.list("script", {
											group: "leaf",
											dataObj: {
												parententry: parentkey,
											}
										});

										let res_leaf = await resp_leaf.json();
										let iter = createParents(parents)


										if (iter) {
											console.log("iter is ", iter);
											let path = "/";
											let isPlugin = false;

											for (let i in parents) {
												if (parents[i].plugin)
													isPlugin = true;

												path += parents[i].name + "/";
											}

											for (let _index in res_leaf["skellist"]) {


												let _entry = res_leaf["skellist"][_index];
												//parent_dict[_entry.name] = _entry.key;
												let child = {
													label: _entry.name,
													key: _entry.key,
													parentObject: iter,
                          renderElement: true,

                        };
												iter.children.push(child)


												if (isPlugin) {
													if (path && _entry) {
														let file_path = path + _entry.name;
														console.log("file_path_", file_path);
														await pythonStore.py.write(path, "/" + _entry.name, _entry.script);
													}
												}

											}


										}
										else {
											console.error("Iter is no defined.")
										}

									};

									let resolveChildrenNodes = async function (parents = [], parentkey) {
										//console.log("resolveChildrenNodes", dataObj);
										let resp_kind = await Request.list("script", {
											group: "node",
											dataObj: {
												parententry: parentkey,
											}

										});

										let res_kind = await resp_kind.json();
										for (let _index in res_kind["skellist"]) {
											//console.log()

											let _entry = res_kind["skellist"][_index];
											let parents_copy = [...parents];
											parents_copy.push(_entry);

											//console.log("lOG SCRIPT:", _entry)
											console.log("Parent:", parents_copy, "entry", _entry)

											createParents(parents_copy);

											await resolveChildrenNodes(parents_copy, _entry.key)
											await resolveChildrenLeaf(parents_copy, _entry.key)
											//files.value.append(res_kind);

										}

									}

									await resolveChildrenNodes([entry], entry["key"]);
									await resolveChildrenLeaf([entry], entry["key"]);

								}

							}
						}

						let _answer = await Request.list("script", {
							dataObj: {
								"plugin": 1
							},
							group: "node"
						});

						let data = await _answer.json();
						if (data.skellist.length <= 0)
						{
							console.log("Creating plugins directory...");
							let _resp = await Request.securePost("/vi/script/add/node/"+rootNode.key, {
								dataObj: {
									name: "importable",
									path: "importable",
									plugin: 1,
									rootNode: false
								}
							});

							let _answer2 = await _resp.json();
							if (_answer2.action === "addSuccess")
								await create();
						}
						else
						{
							await create();
						}

						console.log(tree.data);


				});


					let selectedItemKey = localStorage.getItem(`selected.item.key`);
					let selectedFileKey = localStorage.getItem(`selected.file.key`);
					let count = 30;
					if (selectedItemKey) {
						while (tree.find(selectedItemKey) === null) {
							if (count <= 0) {
								console.warn("There is no tree entry by key ", selectedItemKey)
								break;
							}

							await sleep(100);
							count -= 1;
						}
					}

					if (selectedFileKey && selectedFileKey !== selectedItemKey) {
						count = 30;

						while (tree.find(selectedFileKey) === null) {
							if (count <= 0) {
								console.warn("There is no tree entry by key ", selectedFileKey)
								break;
							}
							await sleep(100);
							count -= 1;

						}
					}

					let callback = function () {
						console.log("Setting item key to ", selectedItemKey)
						tree.selectItem(tree.elements.get(selectedItemKey), selectedItemKey, true);
					}

					if (selectedFileKey)
						tree.selectItem(tree.elements.get(selectedFileKey), selectedFileKey, true, selectedItemKey !== selectedFileKey ? callback : null);
					else if (selectedItemKey)
						callback();
				}


			  await perform();
			}

		}

		watch(() => tree.data.value, function(){
			tree.sort();
			console.log("changed data in tree.data");

			if (tree.selectedItem.value) {
				let element = tree.find(tree.selectedItem.value);
				if (!element) {
					tree.selectedItem.value = "";
				}
			}

			if (tree.selectedFile.value) {
				console.log("Selected File: ", tree.selectedFile.value)

				let element = tree.find(tree.selectedFile.value);
				if (!element) {
					tree.selectedFile.value = "";
					props.manager.hideMirror();
				}
				else
				{
					props.manager.showMirror();
				}
			}
		},
			{ deep: true })

		watch (() => tree.selectedItem.value, function(value, oldValue, onCleanup) {
			console.log("HEllo!")
			if (oldValue) {
				let element = tree.elements.get(oldValue);
				if (element)
					element.classList.remove("selected");
			}
			if (value) {
				let element = tree.elements.get(value);
				if (element)
					element.classList.add("selected");
			}

		});

		watch (()=>tree.elements.data.value, function(value, oldValue, onCleanup){

				for (let key in oldValue){
					let elem = tree.elements.data.value[key];
					if (elem) {
						elem.classList.remove("selected-file");
						elem.classList.remove("selected");
					}
				}

				for (let key in tree.elements.data.value){
					let elem = tree.elements.data.value[key];
					if (elem) {
						elem.classList.remove("selected-file");
						elem.classList.remove("selected");
					}
				}

				let element = tree.elements.get(tree.selectedFile.value);
				if (element)
					element.classList.add("selected-file");

				element = tree.elements.get(tree.selectedItem.value);
				if (element)
					element.classList.add("selected");
			},
			{deep: true}
		)

		watch (() => tree.selectedFile.value, function(value, oldValue, onCleanup) {
			console.log(`Change value from value: ${oldValue} to ${value}`)

			if (oldValue) {
				let element = tree.elements.get(oldValue);
				if (element)
					element.classList?.remove("selected-file");
			}
			if (value) {
				let element = tree.elements.get(value);
				if (element)
					element.classList?.add("selected-file");
			}
		});


		onBeforeMount(async function(){
			await tree.create();
		});

		let helper = {
			move: async function(node_key: string, leaf_key: string){
				let node = tree.find(node_key);
				let leaf = tree.find(leaf_key);
				console.log("tree", tree.data.value.children)
				if (node === null || leaf === null) {
					console.error("Failed to move unknown node key: ", node_key, " or unknown leaf key:", leaf_key);
					console.log("node: ", node, "leaf: ", leaf)
					return;
				}

				if (leaf === tree.data.value || leaf.rootNode) {
					return;
				}

				if (leaf.parentObject.key == node_key) {
					console.warn(`Node ${node} is already a leaf of ${leaf} `);
					return;
				}

				isLoading.value = true;

				//Request.securePost("/vi/script/move",

				Request.securePost("/vi/script/move", {
					dataObj: {
						skelType: leaf.parent ? "node" : "leaf",
						key: leaf.key,
						parentNode: node.key
					},
				}).then(async answ => {

					let resp = await answ.json();
					if (resp.action === "editSuccess") {
						if (tree.isPluginItem(leaf_key)) {
							let path = tree.getPath(leaf_key)
							await pythonStore.py.removeFile("/" + path,  "/" + leaf.label);
						}

						leaf.parentObject.children = leaf.parentObject.children.filter(item => item.key !== leaf.key);
						if (leaf.parentObject.children.length <= 0)
							leaf.parentObject.state.close();

						let _node = tree.find(resp.values.parententry);
						leaf.parentObject = _node;
						_node.children.push(leaf);

						if (!_node.state.isOpen.value)
							_node.state.open();

						if (tree.isPluginItem(leaf_key)) {
							let path = tree.getPath(leaf_key)
							await pythonStore.py.write("/" + path, "/" + leaf.label, resp.values.script);
						}
					}
					else
					{
						console.error(`Failed to edit key: ${leaf.key} parententry: ${node.key}`);

					}
					isLoading.value = false;

				}).catch(err => {
					console.error("Error on edit: ", err);
					isLoading.value = false;
				});

			},
			// type = "leaf"|"node"
			add: function (parentKey: string, type: string, name: string, path: string){

				isLoading.value = true;


				Request.securePost(`/vi/script/add/${type}/${parentKey}`, {
					dataObj: {
						__mode__: "add",
						name: name,
						rootNode: false,
						script: "#### scriptor ####",
						path: path
					}
				}).then(async (res) => {
					console.log("added:", res, res.ok);
					let data = await res.json();

					if (data.action === "addSuccess") {
						tree.addChildren(parentKey, data.values.key, data.values.name, type);

						if (type === "leaf" && tree.isPluginItem(data.values.key)) {
							let path = tree.getPath(data.values.key);
							let element = tree.find(data.values.key);
							await pythonStore.py.write("/"+path, element.label, data.values.script);
						}
					}


					isLoading.value = false;
				});
			},
			edit: function (key: string, type: string, name: string, path: string){

				isLoading.value = true;


				Request.edit(`script`, key, {
					dataObj: {
						__mode__: "edit",
						name: name,
						path: path,
					},
					group: type
				}).then(async (res) => {
					console.log("edit:", res, res.ok);
					let data = await res.json();

					if (data.action === "editSuccess") {
						let path = tree.getPath(data.values.key);
						let element = tree.find(data.values.key);
						if (tree.isPluginItem(data.values.key)) {
							if (type === "leaf")
							{
								await pythonStore.py.removeFile("/" + path, element.label);
							}
							else
							{
								/*await tree.forEachChildren(data.values.key, async function(child){
									let path = tree.getPath(child.key);
									child.oldPath = "/" + path;
									console.log("child:", child, "old path = ", path)

								})*/
							}
						}

						tree.renameLabel(key, data.values.name);

						if (tree.isPluginItem(data.values.key)) {
							if (type === "leaf") {
								await pythonStore.py.write("/" + path, element.label, data.values.script);
							}
							else
							{
								/*await tree.forEachChildren(data.values.key, async function(child){
									let path = tree.getPath(child.key);
									if (!child.parent) {
										console.log("Trying to change: ", child.oldPath, child.label, "/" + path, child.label)
										await pythonStore.py.renameFile(child.oldPath, child.label, "/" + path, child.label);
									}
								})*/

								let newPath = tree.getPath(data.values.key);

								//await pythonStore.py.removeDir("/" + path);
								await pythonStore.py.renameDir("/" + path, "/" + newPath);

							}
						}

					}


					isLoading.value = false;
				});
			},
			remove: function(key: string){
				let entry = tree.find(key);
				if (entry === null) {
					console.log(`There is no node by key ${entry}`);
					return;
				}

				if (entry.rootNode)
					return;

				isLoading.value = true;

				Request.delete("script", key, {
					group: entry.parent ? "node" : "leaf"
				}).then(async (res) => {
					console.log("delete:", res, res.ok);
					if (res.ok) {
						console.log("I'm here!")
						if (tree.isPluginItem(key)) {
							console.log("I'm here 1!")

							let path = tree.getPath(key);
							console.log("I'm here 2!")

							let element = tree.find(key);
							console.log("I'm here [6] SEARCHING!!")

							if (entry.parent === "node") {
								console.log("I'm here REMOVE DIR!")

								await pythonStore.py.removeDir("/" + path + element.label);
								console.log("I'm here 2!")
							}
							else {
								console.log("I'm here REMOVE file!")

								await pythonStore.py.removeFile("/" + path, element.label);
							}
							console.log("I'm here 3!")

						}

						tree.delete(key);

					}

					isLoading.value = false;
				});


			},
			reload: function (event){
				event.target.blur();
				tree.data.value.children = [];
				tree.selectedItem.value = "";
				tree.create();
			},
			saveCode: function(key: string, code: string, callback: Function = null){
				console.log( "saved length:", code.split(/\r\n|\r|\n/).length)
				if (tree.selectedFile.value) {
					//const key = tree.selectedFile.value;
					isLoading.value = true;
					Request.edit("script", key, {
						group: "leaf",
						dataObj: {
							"script": code
						}
					}).then(async (resp) => {
						const data = await resp.json();
						if (data.action === 'editSuccess') {
							console.log("Saved properly!")
							if (tree.isPluginItem(key)) {
								let element = tree.find(key);
								let path = tree.getPath(key);
								console.log("LOG_SAVE:", "path: ", path, " element.name: ", element.label)
								await pythonStore.py.write("/" + path, element.label, code);
							}
							props.manager.save();
						}
						isLoading.value = false;

						if (data.action === 'editSuccess') {
							if (callback)
								callback();
						}

					} )
				}
				else
				{
					console.error("There is no selected file.");
				}
			},
		};

		let removeEntry = function (event: Event){
			event.target.blur();

			let element = tree.find(tree.selectedItem.value);

			if (!element)
				return;

			if (element.rootNode)
				return;

			dialog.reset();

			dialog.instance.value.show();
			dialog.title.value = `Do you really want to delete the selected ${element.parent ? "folder" : "file"}?`;
			dialog.buttonText.value = "Delete";

			let path = "";
			let parent = element.parentObject;
			let parents = []
			while (parent) {
				if (parent.rootNode)
					break;

				//path += parent.label + "/";
				parents.push(parent);

				parent = parent.parentObject;
			}

			parents.reverse();

			for (let i in parents) {
				path += parents[i].label + "/";
			}

			path += element.label;
			dialog.text.value = `${path}`;

			dialog.callback = function() {
				if (tree.selectedItem.value) {
					helper.remove(tree.selectedItem.value)
				}
			}
		};

		let addEntry = function (event: Event, type: string) {
			event.target.blur();

			if (!tree.selectedItem.value)
				return;

			let element = tree.find(tree.selectedItem.value);

			if (!element)
				return;

			let parent = element;
			if (!element.parent)
				parent = element.parentObject;

			// If there is no parent the rootNode will be the parent
			if (parent === undefined) {
				parent = tree.data.value;
			}

			dialog.reset();
			dialog.instance.value.show();
			dialog.title.value = `Add new ${type === 'node' ? 'directory' : 'file'}`;
			dialog.text.value = `Enter a name:`;
			dialog.showInput.value = true;
			dialog.inputText.value = "";
			dialog.type.value = type === 'node' ? "directory" : "file";


			dialog.callback = function() {
				console.log(`Adding to parent ${parent}`)
				console.log("parent:", parent);
				console.log("text:", dialog.inputText);
				console.log("inputPath", dialog.inputPath.value)

				helper.add(parent.key, type, dialog.inputText.value, dialog.inputPath.value)

			}
		}

		let editEntry = function (event: Event) {
			event.target.blur();

			if (!tree.selectedItem.value)
				return;

			let element = tree.find(tree.selectedItem.value);

			if (!element)
				return;

			if (element.rootNode)
				return;

			dialog.reset();
			dialog.instance.value.show();
			dialog.title.value = `Edit ${element.parent ? 'directory' : 'file'}`;
			dialog.text.value = `Enter a new name:`;
			dialog.showInput.value = true;
			dialog.inputText.value = element.label;
			dialog.mode.value = "edit";
			dialog.type.value = element.parent ? "directory" : "file";
			dialog.buttonText.value = "Edit";



			dialog.callback = function() {
				console.log("parent:", parent);
				console.log("text:", dialog.inputText);
				helper.edit(element.key, element.parent ? 'node' : 'leaf', dialog.inputText.value, dialog.inputPath.value)

			}
		}

		let regexp = new RegExp("^[a-zA-Z0-9äöüÄÖÜ_-]*$");
		let regexp_filename = new RegExp("^[a-zA-Z0-9äöüÄÖÜ_-]+?.py$");

		watch(() => dialog.inputText.value, (first, second) => {
			let reg = regexp;
			if (dialog.type.value !== "directory") {
				reg = regexp_filename;
				console.log("USing regexp_file_name: ", regexp_filename);
			}

			if (dialog.inputText.value) {
				console.log("inputText changed!", dialog.inputText.value)

				if (reg.test(dialog.inputText.value)) {
					console.log("IS okay!")
					dialog.inputTextColor.value = "valid-text";
					dialog.inputInstance.value.classList.add("valid-text");

				} else {
					console.log("IS not okay!")
					dialog.inputTextColor.value = "invalid-text";

					dialog.inputInstance.value.classList.add("invalid-text");
				}
			}
		});


		return {
			tree,
			isLoading,
			helper,
			removeEntry,
			dialog,
			addEntry,
			editEntry,
			rootNodeElement,
			pythonStore
		}
	}
}
</script>

<style>
.valid-text {

	color: green !important;
}
.valid-text:hover {
	color: green !important;
}

.invalid-text {
	color: red !important;
}
</style>

<style lang="less" scoped>

.fileTree{
  width: 100%;
  flex: 1 1 100%;
  overflow-y: auto;
  padding: 10px;
  margin: 0;
  list-style: none;
}

.menu {
  margin-top: 0px;
  position: absolute;
  right:0;
  z-index: 666;
}

.header{
  display: flex;
  flex-direction: row;
  background-color: #fff;
  border-bottom: 1px solid @mainColor;
  padding: 10px;

  sl-button{
	margin-right: 10px;

	&::part(base){
	  aspect-ratio: 1;
	  font-size: 1em;
	  height: 35px;
	}

	&::part(label){
	  padding: 0;
	  margin-top: -2px;
	}
  }
}

.spacer{
  flex: 1 1 auto;
}

sl-dialog{
  &::part(body){
	padding-top: 10px;
  }

  &::part(footer){
	display: flex;
	flex-direction: row;
	justify-content: space-between;
  }
}

.new-folder{
 	display: flex;
  flex-direction: row;
  padding: 10px 0 20px 0;

  sl-icon{
	margin-right: 10px;
  }
}

.loading-spinner{
  z-index: 9999;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, .7);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.8em;
}

.last-button{
  margin-right: 0 !important;
}
</style>
