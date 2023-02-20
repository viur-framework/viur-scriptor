<template>
    <Dialog
        :data="dialog"
        v-for="(dialog, key) in dialogStore.dialogContainer" 
        :key="key">
    </Dialog>
</template>

<script lang="ts" setup>
import Dialog from './Dialog.vue';
import {useDialogStore} from '@/stores/dialogs'
const dialogStore = useDialogStore(); 
</script>