<template>
	<textarea ref="element"></textarea>
</template>

<script setup lang="ts">
import { ref, onMounted  } from 'vue'
import {EditorView, keymap, drawSelection} from "@codemirror/view"
import {basicSetup} from "codemirror"
import {python} from "@codemirror/lang-python"
import {syntaxHighlighting, defaultHighlightStyle} from "@codemirror/language"
import {indentLess, indentMore, indentWithTab, indentSelection, insertTab, } from "@codemirror/commands"
import {indentString, indentUnit} from '@codemirror/language'
import { defaultKeymap } from "@codemirror/next/commands";
import {EditorState} from "@codemirror/state"
import { usePythonStore } from '@/stores/PythonStore'
import { useTabStore } from '@/stores/TabStore'

const props = defineProps({
  keyValue: String
})


let element = ref(null);
let view = ref<EditorView>(null);
const initialCode = ref<string>("");
const currentCode = ref<string>("");

const tabStore = useTabStore(); 


function editorFromTextArea(textarea: HTMLTextAreaElement, extensions: any)
{
	let _view = new EditorView({doc: textarea.value, extensions});

	textarea.parentNode.insertBefore(_view.dom, textarea);
	textarea.style.display = "none";

	if (textarea.form) {
		textarea.form.addEventListener("submit", () => {
			textarea.value = _view.state.doc.toString()
		})

	}

	indentString(_view.state, 4);


	let listener = () => {
		let lines = "";
		for (let i = 0; i<_view.state.doc.lines; ++i) {
			let line = _view.state.doc.line(i+1).text;
			lines += line + "\n";
		}

		currentCode.value = lines;

		tabStore.updateCode(props.keyValue, currentCode.value)

		console.log("currentCode.value", currentCode.value, "initialCode.value", initialCode.value)
	};


	_view.dom.addEventListener("input", listener);
	_view.dom.addEventListener("keyup", listener);
	return _view;
}


onMounted(() => {
	/*const value = Object.assign([
		defaultKeymap,
		[]
	]);
	value.push({
		key: "Tab",
		preventDefault: true,
		run: insertTab
		//run: indentLess,
	});*/

	view.value = editorFromTextArea(element.value,
		[
			basicSetup,
			python(),
			syntaxHighlighting(defaultHighlightStyle),
			//keymap.of(value),
			keymap.of([indentWithTab]),
			indentUnit.of("    "),
			EditorState.tabSize.of(4),
			drawSelection(),
			//EditorView.lineWrapping
		]
	);


	let _entry = tabStore.tabMap[props.keyValue]; 
	if (_entry) {
		updateText(_entry.code); 
	}
})

let updateText = function(text: string) {
	initialCode.value = text;

	view.value.dispatch({
		changes: {from: 0, to: view.value.state.doc.length, insert: text}
	})
}




const store = usePythonStore(); 

let executeScript = function (){
	let extraCode = "from scriptor import print, init as __scriptor__init\nawait __scriptor__init()\n";
	let code = currentCode.value; 
	if (currentCode.value.includes("async def main():"))
		code += "\nawait main()"

	// Run this
	store.run(extraCode + code).then(() => {});
};




</script>

<style scoped lang="less">

div.cm-content {
	flex-grow: 0;
}
.cm-line {
	flex-grow: 0;
}
.CodeMirror { text-align: left; }

textarea{
	width: 100%;
	height: 100%;
}

</style>

