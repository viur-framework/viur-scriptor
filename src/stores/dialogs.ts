// @ts-nocheck
import {ref} from "vue";
import {defineStore} from "pinia";
import { dialog } from "electron";

export interface DialogInterface {
    title: string;
    text: string; // Dialog Text
    type: string; // directory || folder,
    acceptEvent: Function;
    showCancelButton: boolean,
    cancelEvent: Function;
    showInputText: boolean;
    buttonText: string;
    id: number;
    prefix: string;
    regexStringExpression?: string;
    closeOnAccept?: boolean;
	initialText: string;
	suffixText: string;
}

export const useDialogStore = defineStore("dialogStore", () => {

    const dialogContainer = ref<Record<number, DialogInterface>>({});
    const idGen = ref<number>(0);

    function open(data:DialogInterface) {
        data.id = ++idGen.value;
        dialogContainer.value[data.id] = data;
    }

    function close(id: number) {
        delete dialogContainer.value[id];
    }


    return {dialogContainer, open, close}
})
