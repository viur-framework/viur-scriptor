<template>

    <div v-if="error.length <= 0" class="logging">
        <EasyDataTable
			:headers="[{ text: 'Log', value: 'log' }]"
			:items="logItems"
			:buttons-pagination="true"
			max-height="500"
			class="log-data-table"
        >
            <template #item-log="{ log }">
                <sl-alert :variant="log.level" open>
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
			  if (obj.constructor == Object)
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
			if (obj.constructor == Object)
                return obj;
		}

		return str;
	}

    pythonStore.py.pyLogging.listen((val) => {
            if (pythonStore.scriptRunnerTab == props.keyValue)
            {
                let entry = val[val.length - 1];
                console.log(`Pushing Data:${entry.level} value ${entry.text} `)

                logItems.value.push({
                  log: {
                      type: entry.level,
                      level: computed(() => {
                          return getThemeByLevel(entry.level);
                      }),
                      text: formatString(entry.text),
                      time: Date.now(),
                      json: isJsonString(entry.text),
                  }
                })
            }
	  })

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
  overflow-y: auto;
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
  height: inherit;
  .vue3-easy-data-table__main {
	height: inherit;
  }


  /deep/ .vue3-easy-data-table__main {
	height: calc(100% - 2.30em);
  }
}

</style>
