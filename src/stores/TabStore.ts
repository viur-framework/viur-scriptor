import {ref, computed} from 'vue';
import {defineStore} from 'pinia'
import {usePython} from "usepython";
import {SlTabGroup} from '@viur/viur-shoelace';
import {usePythonStore} from './PythonStore';
import {useRouter, useRoute} from 'vue-router';
import {useGlobalStore} from "./global";
import {glob} from "typedoc/dist/lib/utils/fs";


interface Tab {
    name: string,
    code: string,
    key: string,
    render: Boolean,
    documentation: Boolean,
    log?: Record<string, any>,
    error?: string,
    leftNode?: Tab,
    rightNode?: Tab,
    previousCode?: string,
    needSave?: boolean
};


export const useTabStore = defineStore('tab', () => {

    const pythonStore = usePythonStore();
    const router = useRouter();
    const route = useRoute();

    const tabMap = ref<Record<string, Tab>>({});
    const tabList = ref([]);

    const tabGroup = ref<SlTabGroup>(null);

    const selectedTab = ref<string>();
    const timeoutEvent = ref<NodeJS.Timeout>();
    const saveEvent = ref<NodeJS.Timeout>();
    const globalStore = useGlobalStore();
    let callback = ref<Function>(null);

    function cancelSaveEvent() {
        if (saveEvent.value) {
            clearTimeout(saveEvent.value);
            saveEvent.value = undefined;
        }
    }

    function startSaveEvent() {
        if (!tabMap.value[selectedTab.value])
            return

        if (tabMap.value[selectedTab.value].needSave && !saveEvent.value) {
            saveCurrentTabCode();
        }
    }

    function saveCurrentTabCode() {
        console.log("starting event");
        saveEvent.value = setTimeout(function () {
            console.log("save timeout")
            callback.value();
            saveEvent.value = undefined;
        }, globalStore.getAutoSaveInterval() * 1000);
    }

    function updateCode(key: string, code: string) {
        if (tabMap.value[key].code !== code) {
            tabMap.value[key].previousCode = tabMap.value[key].code;
            tabMap.value[key].code = code;
            tabMap.value[key].needSave = true;
            console.debug("need save ", key, tabMap.value[key].needSave)
            //console.debug(tabMap.value[key].needSave)
        }


        if (tabMap.value[key].needSave  // require save
            && key === selectedTab.value) {
            if (globalStore.shouldAutoSave) {
                if (callback.value) {
                    if (!tabMap.value[selectedTab.value].documentation) {
                        if (tabMap.value[key].needSave) {
                            if (!saveEvent.value) {
                                saveCurrentTabCode();
                            }
                        }
                    }
                }
            } else {
                if (saveEvent.value) {
                    clearTimeout(saveEvent.value);
                    saveEvent.value = undefined;
                    console.debug("clear save event 1")
                }
            }
        }

    }

    function updateName(key: string, name: string) {
        tabMap.value[key].name = name;
    }

    let getTabName = computed((key: string) => {
        return tabMap.value[key].name;
    })

    function setSaveCallback(f: Function) {
        callback.value = f;
    }

    let getTabCode = (key: string) => {
        let code = tabMap.value[key].code;
        if (code.length > 1 && code[code.length - 1] === '\n')
            code = code.substring(0, code.length - 1);

        return code;
    }

    let update = function () {
        tabList.value.forEach(function (item: Tab) {
            if (item.leftNode)
                item.leftNode = undefined;

            if (item.rightNode)
                item.rightNode = undefined;

            let index = tabList.value.indexOf(item);
            if (index - 1 >= 0) {
                item.leftNode = tabList.value[index - 1];

            }
            if (index + 1 < tabList.value.length) {
                item.rightNode = tabList.value[index + 1];
            }
        });
    }

    let addTab = function (key: string, name: string, code: string = "", documentation = false) {

        if (tabList.value.includes(tabMap.value[key]))
            tabList.value = tabList.value.filter(function (item) {
                return item.key !== key;
            });

        tabMap.value[key] = {
            name: name,
            code: code,
            render: false,
            key: key,
            documentation: documentation,
            needSave: false
        }


        tabList.value.push(tabMap.value[key]);
        update();

        if (tabGroup.value) {
            if (timeoutEvent.value)
                clearTimeout(timeoutEvent.value);

            timeoutEvent.value = setTimeout(() => {
                tabGroup.value.show(key);

                selectTab(key);

            }, 200);

        }
    }

    function selectTab(key: string) {
        if (key in tabMap.value) {
            if (selectedTab.value != key) {
                selectedTab.value = key;

                if (saveEvent.value) {
                    cancelSaveEvent();
                    if (globalStore.shouldAutoSave) {
                        startSaveEvent();
                    }
                }


                router.push(
                    {
                        query: {...route.query, key: key}
                    }
                )

            }

        }
    }

    function openTab(key: string) {
        if (tabMap.value[key]) {
            //const tab = tabMap.value[key];
            if (tabGroup.value) {
                if (timeoutEvent.value)
                    clearTimeout(timeoutEvent.value);

                timeoutEvent.value = setTimeout(() => {
                    tabGroup.value.show(key);

                    selectTab(key);

                }, 200);

            }

            return true;
        }

        return false;
    }

    function removeTab(key: string) {

        let tabInstance: Tab = tabMap.value[key];
        tabList.value = tabList.value.filter(function (item) {
            return item.key !== key;
        });

        update();

        let _keys = Object.keys(tabMap.value);

        let nextIndex = -1;

        let isSelectedTab = false;
        if (_keys.indexOf(selectedTab.value) === _keys.indexOf(key)) {
            isSelectedTab = true;
        }

        delete tabMap.value[key];
        _keys = Object.keys(tabMap.value);

        if (tabInstance.leftNode !== undefined) {
            nextIndex = _keys.indexOf(tabInstance.leftNode.key);
        }

        if (tabInstance.rightNode !== undefined) {
            if (nextIndex === -1)
                nextIndex = _keys.indexOf(tabInstance.rightNode.key);
        }

        let indexOfTab = _keys.indexOf(selectedTab.value);

        if (!isSelectedTab && nextIndex !== indexOfTab) {
            nextIndex = indexOfTab;
        }

        selectedTab.value = "";
        if (_keys.length > 0) {
            if (nextIndex === -1)
                nextIndex = _keys.length - 1;
            selectedTab.value = _keys[nextIndex];
            let _key = _keys[nextIndex];

            if (timeoutEvent.value)
                clearTimeout(timeoutEvent.value);

            timeoutEvent.value = setTimeout(() => {
                if (tabGroup.value) {
                    tabGroup.value.show(_key);
                    selectTab(_key);
                }
            }, 250);
        } else {
            router.push({})
        }

    }

    const getTab = ((key: string): Tab => {
        return tabGroup.value[key];
    });


    return {
        updateCode,
        updateName,
        getTabName,
        tabMap,
        addTab,
        selectTab,
        tabGroup,
        removeTab,
        selectedTab,
        getTabCode,
        getTab,
        openTab,
        setSaveCallback,
        cancelSaveEvent,
        startSaveEvent
    }
})
