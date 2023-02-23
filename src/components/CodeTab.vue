<template>

    <div v-if="error.length <= 0" >
        <EasyDataTable
			:headers="[{ text: 'Log', value: 'log' }]"
			:items="logItems"
			:buttons-pagination="true"
			class="log-data-table logging"
        >
            <template #item-log="{ log }">
                <sl-alert v-if="log.type === 'syslog'" :variant="log.level" open>
                    <template slot:icon>
                        <sl-icon class="log-child" name="info-circle"></sl-icon>
                    </template>
                    <div v-if="log.json">
                        <vue-json-pretty :data="log.text" :deep="1" :showDoubleQuotes="false" :showIcon="true" :showLine="false" />
                    </div>
                        
                    <div v-else>
                          <pre class="alert-child log-child log-child-text">
                                <code>{{ log.text }}</code>
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
<!-- 			pyDialogs.get().push({
				type: "confirm",
				title: data.title, 
        text: data.text,
        cancel: data.cancel,
        done: false
			})-->

			    </template>
		</EasyDataTable>
	</div>
    <div v-else class="logging">
        <sl-alert class="danger-print" variant="danger" open>
            <pre class="error-format">{{ error }}</pre>
		</sl-alert>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeMount } from 'vue';
import { useTabStore } from "@/stores/TabStore";
import VueJsonPretty from 'vue-json-pretty';
import { usePythonStore } from '@/stores/PythonStore';
import Alert from "./Interaction/Alert.vue"; 
import Confirm from "./Interaction/Confirm.vue"; 
import Input from "./Interaction/Input.vue"; 
import Select from "./Interaction/Select.vue"; 
    const pythonStore = usePythonStore();

    interface Props {
        keyValue?: string
    }

    const props = withDefaults(defineProps<Props>(), {
        keyValue: ''
    })

    let tabStore = useTabStore();

    let tab = computed(() => tabStore.getTab(props.key));

    const logItems = ref<Record<string, any>[]>([]);
    const error = ref<string>("");

    function acceptAlert() {
      console.log("alert!");
      pythonStore.py.sendDialogResult("alert", {}).then(() => {
        console.log("sended succesfully!!"); 
      }); 
    }

    function confirmSelect(value: boolean) {
      console.log("alert!");
      pythonStore.py.sendDialogResult("alert", value).then(() => {
        console.log("value succesfully!!"); 
      }); 
    }

    function sendInput(value: any) {
      console.log("alert!");
      pythonStore.py.sendDialogResult("input", value).then(() => {
        console.log("value succesfully!!"); 
      }); 
    }

    function sendSelect(value: any) {
      console.log("alert!");
      pythonStore.py.sendDialogResult("select", value).then(() => {
        console.log("value sendSelect!!"); 
      }); 
    }


    function getThemeByLevel(level: string)
    {
        console.log("level", level);
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

    pythonStore.py.pyLogging.listen((val) => {
            console.log("Notify: python logging", val)
            console.log("pythonStore.scriptRunnerTab:", pythonStore.scriptRunnerTab, " props.keyValue: ", props.keyValue); 
            if (tabStore.selectedTab === props.keyValue)
            {
                for (let i = 0; i<val.length; ++i) {
                  let entry = val[i];
                  if (entry.done)
                    continue;

                console.log(`Pushing Data:${entry.level} value ${entry.text} `)

                logItems.value.push({
                  log: {
                      type: "syslog",
                      level: computed(() => {
                          return getThemeByLevel(entry.level);
                      }),
                      text: formatString(entry.text),
                      time: Date.now(),
                      json: isJsonString(entry.text),
                  }
                })

                entry.done = true;
              }
            }
	  })

    pythonStore.py.pyDialogs.listen((val) => {
        if (pythonStore.scriptRunnerTab == props.keyValue)
            {
                let entry = val[val.length - 1];
                if (entry) {

                  logItems.value.push({
                    log: {
                        type: entry.type,
                        time: Date.now(),
                        ...entry,
                    }
                  })
                }
            }
    }); 

  const clearLog = function(){
		  logItems.value = [];
		  error.value = "";
	}


	const logError = function(value: string){
		error.value = value;
	}

    onBeforeMount(async () => {
		await pythonStore.init(props.keyValue, null, logError, clearLog);
	})

</script>

<style lang="less" scoped>
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
  height: 100%;
  list-style-type: None;
  overflow-y: scroll;
  overflow-x: hidden;
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
}
.danger-print {
  overflow: auto;
  width: 100%;
  height: 80%;
}


.log-data-table {
  height: 100%;
  .vue3-easy-data-table__main {
	height: 100%;

  }

  /deep/ .vue3-easy-data-table__main {
	  height: calc(100% - 2.30em);
		min-height: auto;

  }
}

</style>
