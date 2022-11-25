<template>
  <textarea ref="element" v-model="props.text" @input="props.onchange"></textarea>

</template>

<script lang="ts">
import { ref, onMounted  } from 'vue'
import {EditorView, keymap, drawSelection} from "@codemirror/view"
import {basicSetup} from "codemirror"
import {python} from "@codemirror/lang-python"
import {syntaxHighlighting, defaultHighlightStyle} from "@codemirror/language"
import {insertTab} from "@codemirror/commands"
import {indentString, indentUnit} from '@codemirror/language'
import { defaultKeymap } from "@codemirror/next/commands";
import {EditorState} from "@codemirror/state"

export default {
  name: 'CodeMirrorThing',
  props: {
    text: {
      type: String,
      required: false,
      default: ""
    },
    onchange: {
      type: Function,
      required: true
    },
	  onChangeCode: {
		  type: Function,
		  required: true
	  },
	  manager: Object
  },
  setup(props) {
    let element = ref(null);
    let view = ref<EditorView>(null);
	const initialCode = ref<string>("");
	const currentCode = ref<string>("");


    function editorFromTextArea(textarea: HTMLTextAreaElement, extensions: any) {

      let _view = new EditorView({doc: textarea.value, extensions})
      textarea.parentNode.insertBefore(_view.dom, textarea)
      textarea.style.display = "none"
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

		console.log("currentCode.value", currentCode.value, "initialCode.value", initialCode.value)
		if (currentCode.value != initialCode.value)
		{
			props.onChangeCode(true);
		}
		else
		{
			props.onChangeCode(false);

		}
        props.onchange(lines);


      };

      _view.dom.addEventListener("input", listener)
      _view.dom.addEventListener("keyup", listener)



      return _view
    }






    onMounted(() => {
		const value = Object.assign([
			defaultKeymap,
			[]
		]);
		value.push({
			key: "Tab",
			preventDefault: true,
			run: insertTab,
		});

      view.value = editorFromTextArea(element.value,
          [
              basicSetup,
              python(),
              syntaxHighlighting(defaultHighlightStyle),
              keymap.of(value),
              indentUnit.of("\t"),
              EditorState.tabSize.of(4),
              drawSelection(),
              //drawSelection(),
              //EditorView.lineWrapping
          ]
      );



    })

	let updateText = function(text: string) {
		initialCode.value = text;

		view.value.dispatch({
			changes: {from: 0, to: view.value.state.doc.length, insert: text}
		})
	}


    return {view, element, props, updateText};

  }
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
