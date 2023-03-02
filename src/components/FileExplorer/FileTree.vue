<template>

	<ul class="fileTree">
		<FileTreeItem class="item" :model="tree.data.value" :onselect="tree.selectItem" :helper="helper"></FileTreeItem>
		<!--<div class="loader">
			<sl-spinner-circle></sl-spinner-circle>
		</div>-->

	</ul>


</template>

<script lang="ts">
import {computed, onBeforeMount, onMounted, ref, watch, watchEffect} from "vue";
import {Request} from "@viur/viur-vue-utils";

import FileTreeItem from "./FileTreeItem.vue";
import LoadingSpinner from "../common/LoadingSpinner.vue";
import PythonExecutor from "./PythonExecutor.vue";

import {usePythonStore} from "@/stores/PythonStore";
import { useTabStore } from '@/stores/TabStore';
import {useDialogStore} from "../../stores/dialogs";
import {useI18n} from "vue-i18n";
import {useGlobalStore} from "../../stores/global";
import {useMessageStore} from "../../stores/message";
import { useRoute } from 'vue-router';

export default {
	name: "FileTree",
	components: {FileTreeItem, LoadingSpinner},
	props: {
		onSelectItem: Function,
		manager: Object,
	},

	setup(props){

		const route = useRoute();

		let pythonStore = usePythonStore();
		let tabStore = useTabStore();

		let isLoading = ref<boolean>(false);
		const globalStore = useGlobalStore();

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


      search: function(text: string, children = tree.data.value.children){

        let showList = [];
        for (let child in children) {
          if (text) {
            children[child].renderElement = children[child].label.toLowerCase().includes(text.toLowerCase());
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

			getMyPath: function (key: string, withOwnLabel: boolean = false) {
				let element = tree.find(key);
				if (element) {
					let parent = element.parentObject;
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
			},

			// Select a item from children (left click)
			selectItem: function(element: HTMLDivElement, key: string, skipSave: boolean = false, callback: Function = null) {

				let _entry = tree.find(key);
				if (_entry === null) {
					console.error("Cannot find element ", element, " key", key)
					return;
				}

				if (!_entry.parent) {
					globalStore.setLoading(true);

					if (tabStore.openTab(key)) {
						globalStore.setLoading(false);
					} else {
						Request.view("script", key, {group: "leaf"}).then((answ: Response) => {
							answ.json().then(function (res) {
								if (props.onSelectItem)
									props.onSelectItem();
								props.manager.showMirror();

								tabStore.addTab(key, res.values.name, res.values.script);


								globalStore.setLoading(false);

								if (callback)
									callback();

							});
						}).catch((e) => {
							globalStore.setLoading(false);
							messageStore.addMessage("error", t("tree.select.item.title"), t("tree.select.item.description", {file: _entry.label}));
						})
					}
				}

			},

			create: async function () {
				
				const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
				async function perform() {

					let createParents = function(parents: any){
						let iter = tree.data.value;

						for (let i in parents) {
							let parent = parents[i];
							if (!tree.isExistingLabel(parent.name, iter.children)) {
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
											new_children.state.isOpen.value = false;
										},
										open: function () {
											new_children.state.isOpen.value = true;
											//localStorage.setItem(`children.${parent.key}.open`, "1");

										},
										close: function () {
											new_children.state.isOpen.value = false;
											//localStorage.setItem(`children.${parent.key}.open`, "0");

										},
										toggle: function () {
											new_children.state.isOpen.value = !new_children.state.isOpen.value;

											//localStorage.setItem(`children.${parent.key}.open`, new_children.state.isOpen.value ? "1" : "0");
										}

									},
                  renderElement: true,

                }

								iter.children.push(new_children);
								iter = new_children;
							} else {
								let children = iter.children;
								iter = tree.getChildrenByLabel(parent.name, children);

							}
						}

						return iter;
					}

					await Request.get("/json/script/listRootNodes").then(async (answer: Response) => {
						let res = await answer.json();
						let rootNode = res[0];
						if (route.query.rkey)
							rootNode = {key: route.query.rkey} 
						
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

								for (let index in data["skellist"]) {
									const skel: any = data["skellist"][index];

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
														await pythonStore.py.write(path, "/" + _entry.name, _entry.script);
													}
												}

											}


										}
										else {
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



				});


				}


			  globalStore.setLoading(true);
			  await perform();
			  globalStore.setLoading(false);

			  if (route.query.key) {
				let entry = tree.find(route.query.key);

				let parent = entry.parentObject;

				while (parent) {
					if (!parent.state.isOpen.value)
						parent.state.open();

					parent = parent.parentObject;
				}
				this.selectItem(null, route.query.key);
			  }


			}

		}

		watch(() => tree.data.value, function(){
			tree.sort();
		},{ deep: true })




		onBeforeMount(async function(){
			await tree.create();
		});

		const dialogStore = useDialogStore();
		const {t} = useI18n();

		const messageStore = useMessageStore();

		let helper = {
			move: async function(node_key: string, leaf_key: string){
				let node = tree.find(node_key);
				let leaf = tree.find(leaf_key);
				if (node === null || leaf === null) {
					console.error("Failed to move unknown node key: ", node_key, " or unknown leaf key:", leaf_key);
					return;
				}

				if (leaf === tree.data.value || leaf.rootNode) {
					return;
				}

				if (leaf.parentObject.key == node_key) {
					console.warn(`Node ${node} is already a leaf of ${leaf} `);
					return;
				}

				globalStore.setLoading(true);

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

						messageStore.addMessage("success", t("tree.action.move.success.title"), "")
					}
					else
					{
						console.error(`Failed to edit key: ${leaf.key} parententry: ${node.key}`);
						messageStore.addMessage("error", t("tree.action.move.failed.title"), "")

					}
					globalStore.setLoading(false);

					//isLoading.value = false;

				}).catch(err => {
					console.error("Error on edit: ", err);
					globalStore.setLoading(false);
					messageStore.addMessage("error", t("tree.action.move.failed.title"), "")

					//isLoading.value = false;
				});

			},
			// type = "leaf"|"node"
			clone: function (fileKey: string, parentKey: string, name: string){

				globalStore.setLoading(true);

				Request.view("script", fileKey, {
					group: "leaf"
				}).then (async (res) => {
					let data = await res.json();
					const code = data.values.script.length  <= 0 ? pythonStore.defaultCode : data.values.script;
					await this.add(parentKey, "leaf", name, "", code);
					messageStore.addMessage("success", t("tree.action.clone.success.title"), "")

				}).catch((e) => {
					messageStore.addMessage("error", t("tree.action.clone.failed.title"), "")

					globalStore.setLoading(false);
				})



			},

			add: function (parentKey: string, type: string, name: string, path: string, code: string = pythonStore.defaultCode){

				globalStore.setLoading(true);
				Request.securePost(`/vi/script/add/${type}/${parentKey}`, {
					dataObj: {
						__mode__: "add",
						name: name,
						rootNode: false,
						script: code,
						path: path
					}
				}).then(async (res) => {
					let data = await res.json();

					if (data.action === "addSuccess") {
						tree.addChildren(parentKey, data.values.key, data.values.name, type);

						if (type === "leaf" && tree.isPluginItem(data.values.key)) {
							let path = tree.getPath(data.values.key);
							let element = tree.find(data.values.key);
							await pythonStore.py.write("/"+path, element.label, data.values.script);
						}
						messageStore.addMessage("success", t("tree.action.add.success.title"), "")

					}
					else {
						messageStore.addMessage("error", t("tree.action.add.failed.title"), "")

					}

					globalStore.setLoading(false);
				}).catch((e) => {
					messageStore.addMessage("error", t("tree.action.add.failed.title"), "")
					globalStore.setLoading(false);
				});
			},
			edit: function (key: string, type: string, name: string, path: string){

				globalStore.setLoading(true);



				Request.edit(`script`, key, {
					dataObj: {
						__mode__: "edit",
						name: name,
						path: path,
					},
					group: type
				}).then(async (res) => {
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

						messageStore.addMessage("success", t("tree.action.edit.success.title"), "")


					}
					else {
						messageStore.addMessage("error", t("tree.action.edit.failed.title"), "")

					}

					globalStore.setLoading(false);
				}).catch((e) => {
					globalStore.setLoading(false);

					messageStore.addMessage("error", t("tree.action.edit.failed.title"), "");
				});
			},
			remove: function(key: string){
				let entry = tree.find(key);
				if (entry === null) {
					return;
				}

				if (entry.rootNode)
					return;

				globalStore.setLoading(true);


				Request.delete("script", key, {
					group: entry.parent ? "node" : "leaf"
				}).then(async (res) => {
					if (res.ok) {
						if (tree.isPluginItem(key)) {

							let path = tree.getPath(key);

							let element = tree.find(key);

							if (entry.parent === "node") {

								await pythonStore.py.removeDir("/" + path + element.label);
							}
							else {

								await pythonStore.py.removeFile("/" + path, element.label);
							}

						}

						tree.delete(key);
						messageStore.addMessage("success", t("tree.action.delete.success.title"), "");

					}
					else {
						messageStore.addMessage("error", t("tree.action.delete.failed.title"), "");

					}

					globalStore.setLoading(false);

				}).catch((e) => {
					globalStore.setLoading(false);
					messageStore.addMessage("error", t("tree.action.delete.failed.title"), "");
				});


			},
			reload: function (){
				tree.data.value.children = [];
				tree.create();
			},
			rename: function (key: string){
			},

			getMyPath: tree.getMyPath,
			getPath: tree.getPath,
			saveCode: function(key: string, code: string, callback: Function = null){
				 //const key = tree.selectedFile.value;
				globalStore.setLoading(true);
				Request.edit("script", key, {
					group: "leaf",
					dataObj: {
						"script": code
					}
				}).then(async (resp) => {
					const data = await resp.json();
					if (data.action === 'editSuccess') {
						if (tree.isPluginItem(key)) {
							let element = tree.find(key);
							let path = tree.getPath(key);
							await pythonStore.py.write("/" + path, element.label, code);
						}
						props.manager.save();
					}
					globalStore.setLoading(false);

					if (data.action === 'editSuccess') {
						if (callback)
							callback();

						messageStore.addMessage("success", t("tree.action.save.success.title"), "");

					}
					else {
						messageStore.addMessage("error", t("tree.action.save.failed.title"), "");
					}

				}).catch((e) => {
					globalStore.setLoading(false);
					messageStore.addMessage("error", t("tree.action.save.failed.title"), "");

				})
			},
		};



		return {
			tree,
			helper,
			pythonStore,
			globalStore
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
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  height: 1px;
  flex: 1;
  overflow-y: auto;
  padding: 2px 5px 5px 5px;
  margin: 0;
  list-style: none;
  position: relative;

   &::-webkit-scrollbar-track {
        background-color: transparent;
    }

    &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
        background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background-color: var(--sl-color-neutral-300);
        border-radius: 3px;
    }

    &::-webkit-scrollbar-button {
        height: 6px;
    }
}

.loader{
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, .8);

  sl-spinner-circle{
	font-size: 2em;
	--track-width: 4px;
  }
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
