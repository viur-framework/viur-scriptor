<template>
    <sl-dialog ref="dialog" :label="data.title" class="dialog-deny-close" @sl-after-hide="destroyDialog">

        <div>
            {{  data.text }}
            <div class="new-folder">
                <sl-icon library="bootstrap" :name="data.type === 'directory' ? 'folder' : 'file-earmark'"></sl-icon>
                <div :class="inputTextColorClass">
                    {{ previewText }}
                </div>
            </div>
        </div>

        <sl-input v-if="data.showInputText" v-model="inputText"></sl-input>
            <sl-button v-if="data.showCancelButton" slot='footer' variant="danger" @click="data.cancelEvent">
                Cancel
            </sl-button>
        <sl-button slot="footer" variant="success" @click="accept">
            {{ data.buttonText }}
        </sl-button>
    </sl-dialog>
</template>

<script setup lang="ts">
import { useDialogStore, DialogInterface } from "@/stores/dialogs";
import { SlDialog, SlInput } from "@viur/viur-shoelace";
import { ref, onMounted, watch, computed } from  "vue";


/*
export interface Props {
    title: string,
    text: string, // Dialog Text
    type: string, // directory || folder,
    acceptEvent: Function,
    cancelEvent: Function,
    showInputText: boolean,
    buttonText: string,
    id: number,
    prefix: string,
    regexStringExpression: string,
    acceptClose: boolean
}*/

export interface Props {
    data: DialogInterface,
}


// "^[a-zA-Z0-9äöüÄÖÜ_-]*$"
function defaultHide() {
    dialog.value.hide(); 
}

const props = withDefaults(defineProps<Props>(), {
  data: null
})

if (!props.data.prefix) {
    props.data.prefix = ""; 
}

console.log(`Props id: ${props.data.id}`)

const dialog = ref<SlDialog>();
const inputText = ref<string>(""); 
const inputTextColorClass = ref<string>(""); 

onMounted(() => {
    dialog.value.show(); 
})

watch(inputText, (a, b) => {
    console.log(inputText.value);
})


const dialogStore = useDialogStore();
function destroyDialog() {
    dialogStore.close(props.data.id); 
}

const previewText = computed(function() {
    if (!props.data.showInputText)
        return props.data.prefix; 

    return props.data.prefix + inputText.value; 
}); 

if (props.data.regexStringExpression) {
    const regex = new RegExp(props.data.regexStringExpression); 
    watch(previewText, () => {

        const text = props.data.prefix + inputText.value; 

        if (regex.test(text)) {
            //dialog.value.
            inputTextColorClass.value = "valid-text";
        }
        else
        {
            inputTextColorClass.value = "invalid-text";
        }
    })
}

function accept() {
    if (props.data.closeOnAccept) {
        dialog.value.hide();
    }
    
    destroyDialog();

    if (props.data.acceptEvent) {
        props.data.acceptEvent();
    }
}

</script>

<style lang="less" scoped>
.new-folder{
    display: flex;
    flex-direction: row;
    padding: 10px 0 20px 0;

    sl-icon{
        margin-right: 10px;
    }
}

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