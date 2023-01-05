import { ref, computed } from 'vue'; 
import { defineStore } from 'pinia'
import { usePython} from "usepython";
import { SlTabGroup } from '@viur/viur-shoelace';
interface Tab
{
    name: string,
    code: string,
    render: Boolean
}; 


export const useTabStore = defineStore('tab', () => {

	const tabMap = ref<Record<string, Tab>>({}); 
    const tabGroup = ref<SlTabGroup>(null);

    const selectedTab = ref<string>(); 
    const timeoutEvent = ref<NodeJS.Timeout>(); 

    function updateCode(key: string, code: string) {
        tabMap.value[key].code = code; 
    }

    function updateName(key: string, name: string) {
        tabMap.value[key].name = name;
    }

    let getTabName = computed((key: string) => {
        return tabMap.value[key].code; 
    })

    let addTab = function(key: string, name: string, code: string) {

        console.log("Adding code", code)
        tabMap.value[key] = {
            name: name,
            code: code,
            render: false
        }

        

        if (tabGroup.value) {
            if (timeoutEvent.value)
                clearTimeout(timeoutEvent.value); 

            timeoutEvent.value = setTimeout(() => {
                tabGroup.value.show(key); 
                selectedTab.value = key; 
            }, 200); 

            console.log("TabGroup SHow: ", key)
        }
    }

    function selectTab(key: string) {
        if (key in tabMap.value) {
            selectedTab.value = key; 
            console.log("Calling selectTab Tab", selectedTab.value)
        }
    }

    function removeTab(key: string) {
        let _keys = Object.keys(tabMap.value); 

        let nextIndex = 0;
        if (_keys.indexOf(key) >= _keys.length-1)
            nextIndex = -1;

        
        delete tabMap.value[key]; 
        _keys = Object.keys(tabMap.value); 

        console.log(tabMap.value); 

        selectedTab.value = "";
        console.log("Removing Key", key)

        console.log("REmove Tab keys left", _keys)
        if (_keys.length > 0) {
            if (nextIndex === -1)
                nextIndex = _keys.length - 1; 
            selectedTab.value = _keys[0]; 
            console.log("Select Tab in remove Tab", selectedTab.value)
            let _key = _keys[0]; 

            if (timeoutEvent.value)
                clearTimeout(timeoutEvent.value);
            
            timeoutEvent.value  = setTimeout(() => {
                if (tabGroup.value) {
                    tabGroup.value.show(_key); 
                    console.log("Tab Group show: ", selectedTab.value)
                    selectedTab.value = _key; 
                }
            }, 250); 
        }

        console.log("Removing selectTab Tab", selectedTab.value)
    }

	return { updateCode, updateName, getTabName, tabMap, addTab, selectTab, tabGroup, removeTab, selectedTab }
})
