<template>

    <sl-card  :class="'interaction'">
        <div slot="header">
            {{ props.title }}
        </div>

		<p class="paragraph">
			{{  props.text }}
		</p>

    <sl-table id="exampletable" rowselect rowindexes sort open>
  <table>
    <thead>
        <tr>
            <th width="150">First Column</th>
            <th>Second Column</th>
            <th tabulator-formatter="html">Thrid Column</th>
        </tr>
    </thead>
  
    <tbody>
        <tr>
          <td>Hello 200</td>
          <td>Alpha</td>
          <td>3</td>
        </tr>
        <tr>
          <td>Hello 20</td>
          <td>Gamma</td>
          <td>40</td>
        </tr>
        <tr>
          <td>Hello 1</td>
          <td>Delta</td>
          <td>15</td>
        </tr>
        <tr>
          <td>Hello</td>
          <td>Zeta</td>
          <td><span style="font-weight:bold">4</span></td>
        </tr>
    </tbody>
  </table>
</sl-table>
        <div slot="footer">
            <sl-button
				   size="small"
				   v-show="render"
				   variant="success"
				   @click="send"> {{ t("send") }} </sl-button>
        </div>
    </sl-card>
</template>


<script setup lang="ts">
export interface Props {
    title: String,
    text: String,
    type: String,
    select: Function,
    empty: Boolean,
    useTime: Boolean
}


import {onMounted, ref, watch} from 'vue';
import { useI18n } from 'vue-i18n';
import { nextTick } from 'vue'
const render = ref(true);
const {t} = useI18n();
const selectedValue = ref<boolean>(undefined);
const value = ref<String>("");

const error = ref<String>("");


const props = defineProps<Props>();

function send() {
    if (!render.value)
        return;

    if (!props.empty) {
        if (!value.value) {
            error.value = t("error.empty");
            return;
        }
    }

}

onMounted(async function(){
  await nextTick();

  let x = document.getElementsByClassName("tabulator-col-sorter-element")[0];
  console.log(document.getElementsByClassName("tabulator-col-sorter-element"))
  x.click();
})


</script>


<style scoped>
    .disabled {

    }
.card-header {
    max-width: 300px;
  }

  .card-header [slot='header'] {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-header h3 {
    margin: 0;
  }

  .card-header sl-icon-button {
    font-size: var(--sl-font-size-medium);
  }

.error-message {
   margin-bottom: 15px;
}

#exampletable {
  overflow: auto;
}

</style>
