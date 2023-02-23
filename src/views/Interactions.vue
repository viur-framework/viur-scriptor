<template>
    <div class="container">
        <div class="row">

                    
            <sl-details summary="Alert" open>
                <Alert :text="'Das ist eine Nachricht!'"></Alert>
            </sl-details>
        </div>
        <div class="row">
            <sl-details summary="Confirm" open>

                <div class="data-grid">
                    <Confirm title="Artikeln löschen" text="Willst du wirklich alle Einträge löschen? Das Löschen kann nicht wieder rückgängig gemacht werden." :select="confirmValue" :cancel=true></Confirm>
                    <Confirm title="Artikeln löschen" text="Willst du wirklich alle Einträge löschen? Das Löschen kann nicht wieder rückgängig gemacht werden." :select="confirmValue" :cancel=false></Confirm>
                </div>
            </sl-details>

        </div>

        <div class="row">
            <sl-details summary="Input" open>

                <div class="data-grid">
                    <Input type="string" title="Zeichenkette" text="type='string'" :select="confirmValue" :cancel=true></Input>
                    <Input type="date" title="Datum" text="type='date'" :select="confirmValue" :cancel=true></Input>
                    <Input type="number" title="Nummer" text="type='number'" :select="confirmValue" :cancel=true></Input>
                    <Input type="text" title="Text" text="type='text'" :select="confirmValue" :cancel=true></Input>

                </div>
            </sl-details>
        </div>


        <div class="row">
            <sl-details summary="Select" open>

                <div class="data-grid">
                    <Select :options="['A', 'B', 'c', 'd', 'aa', 'bb', 'cccc', 'XYZWDWDWWD']" :multiple="false" text="A oder B" title="Select (not multiple)"></Select>
                    <Select :options="['A', 'B', 'C', 'D', 'E', 'T', 'G']" :multiple="true" text="A oder B" title="Select (multiple)"></Select>

                </div>
            </sl-details>
        </div>

    </div>
</template>

<script setup lang="ts">
import Alert from "../components/Interaction/Alert.vue"; 
import Confirm from "../components/Interaction/Confirm.vue"; 
import Input from "../components/Interaction/Input.vue"; 
import Select from "../components/Interaction/Select.vue"; 

function confirmValue(value: String) {
    console.log("confirmValue:", value)
}

</script>

<style scoped>

.container {
    display: grid;
    flex-wrap: wrap;
    justify-content: start;
    overflow: auto; 
}

.data-grid {
    display: grid; 
    overflow-x: auto; 
    grid-template-columns: repeat(5, 1fr);
    justify-content: space-between;
    grid-gap: 10px;
}

sl-details {
    width: 100% !important;
    max-width: 100% !important;
}
</style>