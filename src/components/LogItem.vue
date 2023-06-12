<script setup lang="ts">
const props = defineProps({
  source: {
    type: Object,
    default: () => ({}),
  },
});

const log = props.source; 

import Alert from "./Interaction/Alert.vue";
import Confirm from "./Interaction/Confirm.vue";
import Input from "./Interaction/Input.vue";
import Select from "./Interaction/Select.vue";
import DiffCompare from "../components/Interaction/DiffCompare.vue";
import { usePythonStore } from '@/stores/PythonStore';
import VueJsonPretty from 'vue-json-pretty';

const pythonStore = usePythonStore();


function acceptAlert() {
      pythonStore.py.sendDialogResult("alert", {}).then(() => {
      });
    }

    function confirmSelect(value: boolean) {
      pythonStore.py.sendDialogResult("alert", value).then(() => {
      });
    }

    function sendInput(value: any) {
      pythonStore.py.sendDialogResult("input", value).then(() => {
      });
    }

    function sendSelect(value: any) {
      pythonStore.py.sendDialogResult("select", value).then(() => {
      });
    }

</script>

<template>
        <sl-alert v-if="source.type === 'syslog'" :variant="source.level" open>
                  <template slot:icon>
                      <sl-icon class="log-child" name="info-circle"></sl-icon>
                  </template>
                  <div v-if="source.json">
                      <vue-json-pretty :data="source.text" :deep="1" :showDoubleQuotes="false" :showIcon="true" :showLine="false" />
                  </div>

                  <div v-else>
                        <pre class="alert-child log-child log-child-text">
                              <code>{{ source.text }}</code>
                        </pre>
                  </div>
              </sl-alert>
              <div v-else-if="log.type === 'alert'">
                  <Alert :accept="acceptAlert" :text="log.text"></Alert>
              </div>

              <div v-else-if="log.type === 'confirm'">
                <Confirm :select="confirmSelect" :text="log.text" :title="log.title" :cancel="log.cancel"></Confirm>
              </div>
              <div v-else-if="log.type === 'input'">
                <Input :useTime="log.use_time" :type="log.input_type" :select="sendInput" :text="log.text" :title="log.title" :empty="log.empty"></Input>
              </div>
              <div v-else-if="log.type === 'select'">
                <Select :select="sendSelect" :text="log.text" :title="log.title" :multiple="log.multiple" :options="log.choices"></Select>
              </div>
              <div v-else-if="log.type === 'diffcmp'">
                <DiffCompare  :title="log.title" :values="log.changes"></DiffCompare>
              </div>

  
</template>

<style lang="less" scoped>
.item-inner {
  .head {
    font-weight: 500;
  }
  span:first-child {
    margin-right: 1em;
  }
  .desc {
    padding-top: .5em;
    text-align: justify;
  }
}

.error-format {
  margin-left: 10px;
  height: 80%;
  width:80%;
}
.danger-print {
  overflow: auto;
  width: 100%;
  height: 80%;
}
.log-child {
  display: inline-block;
  margin-right: 5px;
}
.log-child-text {
  margin-left: 5px;
  white-space: normal;
  word-break: break-word;
}
.log-child {
  display: inline-block;
  margin-right: 5px;
}
.logging {
  width: 100%;
  flex: 1;
  height: 1px;
  list-style-type: None;
  margin: 0;
  sl-alert{
	margin-bottom: 15px;
	&::part(message){
		padding: 0 15px 0 5px;
  	}
	&::part(icon){
		font-size: 1em;
	  	padding-left: 15px;
  	}
  }
  :deep(.vue3-easy-data-table__body){
	tr{
	  td{
		padding: 10px;
	  	background-color: transparent !important;
	  }
	}
  }
  :deep(.vue3-easy-data-table__header){
	display: none;
  }
}
.danger-print {
  overflow: auto;
  width: 100%;
  height: 80%;
}
.log-data-table {
  .interaction{
	font-size: 1.2em;
  }
  .vue3-easy-data-table__main {
	flex: 1;
  }
  /deep/ .vue3-easy-data-table__main {
	  height: calc(100% - 2.30em);
		min-height: auto;
  }
}
.wrap{
  height: 100%;
  display: flex;
  flex-direction: column;
}
.header{
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 7px;
  sl-progress-bar{
	flex: 1 1 100%;
	--height: 6px;
	--indicator-color: @mainColor;
  }
}
.steps{
  white-space: nowrap;
  color:  @mainColor;
  font-size: .9em;
  margin-left: 15px;
}
.current-info{
  white-space: nowrap;
  font-size: .9em;
  margin-left: 15px;
  padding-left: 15px;
  width: 80ch;
  overflow: hidden;
  text-overflow: ellipsis;
  border-left: 1px solid @mainColor;
}


</style>
