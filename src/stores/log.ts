// @ts-nocheck
import {ref, computed} from "vue";
import {defineStore} from "pinia";
import { usePythonStore } from "./PythonStore";
import { ProgressbarDetails } from "@/usepython/dist/interfaces";

export const useLogStore = defineStore("log", () => {
    const pythonStore = usePythonStore(); 
	const logMap = ref<Record<string, any>>({});
	function formatString(str: string) {
        if (isJsonString(str))
      {
          let obj = JSON.parse(str);
                  return obj;
          }
  
          return str;
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

    pythonStore.py.pyLogging.listen((val) => {
        if (!(pythonStore.scriptRunnerTab in logMap.value))
            logMap.value[pythonStore.scriptRunnerTab] = ref([]); 
         
        //console.log("Notify: python logging", val)
        //console.log("pythonStore.scriptRunnerTab:", pythonStore.scriptRunnerTab, " props.keyValue: ", props.keyValue); 
        {
          console.error("pythonStore.py.pyLogging"); 

            for (let i = 0; i<val.length; ++i) {
                let entry = val[i];
                if (entry.done)
                    continue;

                console.log(`Pushing Data:${entry.level} value ${entry.text} `)
                console.error(logMap.value[pythonStore.scriptRunnerTab])
                logMap.value[pythonStore.scriptRunnerTab].push({
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
        if (!(pythonStore.scriptRunnerTab in logMap.value))
            logMap.value[pythonStore.scriptRunnerTab] = ref([]);  

        {
            for (let i = 0; i<val.length; ++i) {
                let entry = val[i];
                if (entry.done)
                    continue;
                
                if (entry) {

                    logMap.value[pythonStore.scriptRunnerTab].push({
                        log: {
                            type: entry.type,
                            time: Date.now(),
                            ...entry,
                        }
                    })

                    entry.done = true;
                }
            }
        }
}); 
    const progessBarMap = ref<Record<string, ProgressbarDetails>>({});


    pythonStore.py.progressBar.listen((val) => {
        progessBarMap.value[pythonStore.scriptRunnerTab] = val; 
    })

    function clear(key: String) {
        logMap.value[key] = ref([]); 
    }


    return {logMap, clear, progessBarMap}
})