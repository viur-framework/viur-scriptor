<template>

  <div v-if="error.length <= 0" class="wrap">
  <div class="header" v-if="progressBarDetails.step > 0">
    <sl-progress-bar :value="progressBarDetails.total"></sl-progress-bar>
    <div class="steps">
      {{  t('step') + " " + progressBarDetails.step + " " + t('') + " " + progressBarDetails.maxStep }}
    </div>
    <div class="current-info">
      {{ progressBarDetails.txt }}
    </div>
  </div>

	    <div ref="logContainer" class="log-container">
    <div v-for="(log, index) in logItemsNew" :key="index" class="log-entry">
              <sl-alert v-if="log.type === 'syslog'" :variant="log.level" open>
                  <template slot:icon>
                      <sl-icon class="log-child" name="info-circle" ></sl-icon>
                  </template>
                  <div v-if="log.json" >
                      <vue-json-pretty :data="log.text" :deep="1" :showDoubleQuotes="false" :showIcon="true" :showLine="false" />
                  </div>

                  <div v-else>
                        <pre class="alert-child log-child log-child-text">

                          {{ log.text }}
                        </pre>
                  </div>
              </sl-alert>
              <div v-else-if="log.type === 'alert'">
                  <Alert :accept="acceptAlert" :text="log.text" :imageURL="log.image" :key="log.key" :entry="log"></Alert>
              </div>

              <div v-else-if="log.type === 'confirm'">
                <Confirm :select="confirmSelect" :text="log.text" :title="log.title" :cancel="log.cancel" :imageURL="log.image" :key="log.key" :entry="log"></Confirm>
              </div>
              <div v-else-if="log.type === 'input'">
                <Input :useTime="log.use_time" :type="log.input_type" :select="sendInput" :text="log.text" :title="log.title" :empty="log.empty" :imageURL="log.image" :key="log.key" :placeholder="log.placeholder" :entry="log"></Input>
              </div>
              <div v-else-if="log.type === 'select'">
                <Select :select="sendSelect" :text="log.text" :title="log.title" :multiple="log.multiple" :options="log.choices" :imageURL="log.image" :key="log.key"  :entry="log"></Select>
              </div>
              <div v-else-if="log.type === 'image_select'">
                <Select :select="sendSelect" :text="log.text" :title="log.title" :multiple="log.multiple" :options="log.choices" :imageURL="log.image" :key="log.key"  :entry="log"></Select>
              </div>
              <div v-else-if="log.type === 'diffcmp'">
                <DiffCompare  :title="log.title" :values="log.changes" :imageURL="log.image" :key="log.key"></DiffCompare>
              </div>


              <div v-else-if="log.type === 'table'">
                <MyTable :header="log.header" :rows="log.rows" :selectable="log.select" :sendEvent="sendTable" :multiple="log.multiple" :imageURL="log.image" :key="log.key" :entry="log"></MyTable>
              </div>
    </div>
  </div>
</div>
  <div v-else class="logging">
      <sl-alert class="danger-print" variant="danger" open>
          <pre class="error-format">{{ error }}</pre>
  </sl-alert>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, onBeforeMount, nextTick, watch} from 'vue';
import { useTabStore } from "@/stores/TabStore";
import { useLogStore } from "@/stores/log";
import { useGlobalStore } from "@/stores/global";

import VueJsonPretty from 'vue-json-pretty';
import { usePythonStore } from '@/stores/PythonStore';
import Alert from "./Interaction/Alert.vue";
import Confirm from "./Interaction/Confirm.vue";
import Input from "./Interaction/Input.vue";
import Select from "./Interaction/Select.vue";
import DiffCompare from "../components/Interaction/DiffCompare.vue";
import MyTable from "../components/Interaction/Table.vue";

import { ProgressbarDetails } from '@/usepython/dist/interfaces';
import {useI18n} from "vue-i18n";
    const pythonStore = usePythonStore();
	const globalStore = useGlobalStore();

    interface Props {
        keyValue?: string
    }

    const props = withDefaults(defineProps<Props>(), {
        keyValue: ''
    })

  const {t} = useI18n();

    let tabStore = useTabStore();

    let tab = computed(() => tabStore.getTab(props.key));

    const logItems = ref<Record<string, any>[]>([]);
    const error = ref<string>("");

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

    function sendTable(value: any) {
      pythonStore.py.sendDialogResult("table", value).then(() => {
      });
    }


    function getThemeByLevel(level: string)
    {
        switch (level)
        {
            case "debug": return "neutral";
            case "error": return "danger";
            case "warning": return "warning";
            case "info": return "info";
        }
        return "";
    }

    function isJsonString(str: string)
    {
      try {
          let obj = JSON.parse(str);
          if (obj.constructor === Object || obj.constructor === Array)
            return true;
          else
            return false;

      } catch (e) {
          return false;
      }

		  return true;
    }

	function formatString(str: string) {
	  if (isJsonString(str))
    {
        let obj = JSON.parse(str);
				return obj;
		}

		return str;
	}

  const logStore = useLogStore();


  const clearLog = function(){
		  logItems.value = [];
		  error.value = "";
      logStore.clear(props.keyValue);
	}


	const logError = function(value: string){
		error.value = value;
	}

    onBeforeMount(async () => {
		await pythonStore.init(props.keyValue, null, logError, clearLog);
	})

  const logItemsNew = computed(function(){
    return logStore.logMap[props.keyValue] ? logStore.logMap[props.keyValue] : [];
  });

  const progressBarDetails = computed(function(){
    let details:  ProgressbarDetails = logStore.progessBarMap[props.keyValue];
    return details ? details : {
      total: 100,
      step: -1,
      maxStep: -1,
      txt: ""
    };
  })

const logs = ref([]);
const logContainer = ref(null);

console.log(logStore.updateLogMap)

watch(() => logStore.updateLogMap, (value, newValue, blabla) => {
	if (value) {
		if (tabStore.selectedTab == props.keyValue) {

			console.log("globalStore.shouldAutoscroll", globalStore.shouldAutoscroll)
			if (globalStore.shouldAutoscroll) {
				nextTick(() => {
					const container = logContainer.value;
					if (container) {
						container.scrollTop = container.scrollHeight;

					}
				})
			}

			logStore.reset()
		}
	}
});

function addLog(newLog) {
  if (logs.value.length >= 200) {
    logs.value.shift(); // Entfernt den ersten Log-Eintrag
  }
  logs.value.push(newLog); // Fügt den neuen Log am Ende hinzu

  // Scrollt zum neuesten Log-Eintrag
}

</script>

<style lang="less" scoped>
.log-container {
	display: flex;
  flex-direction: column;
  max-height: 1000px;
  overflow-y: scroll;
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
