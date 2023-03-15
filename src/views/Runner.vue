<template>
    <div class="wrap">
        <CodeTab :key-value="route.params.key"></CodeTab>
    </div>
    <footer class="footer">

        <sl-badge v-show="pythonStore.isExecuting" variant="success" class="is-running" pulse>{{  pythonStore.runningText }}</sl-badge>

        <sl-button v-show="!pythonStore.isExecuting" size="small"  variant="primary" @click="run">
            {{ t("run") }}
        </sl-button>

        <sl-button v-show="pythonStore.isExecuting" size="small" variant="primary" @click="interruptCode">Cancel</sl-button>
    </footer>

</template>

<script setup lang="ts">
import CodeTab from '@/components/CodeTab.vue';
import { useGlobalStore } from '@/stores/global';
import { usePythonStore } from '@/stores/PythonStore';
import { Request } from '@viur/viur-vue-utils';
import { onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const route = useRoute();
const globalStore = useGlobalStore();
const pythonStore = usePythonStore();
const {t} = useI18n();

function interruptCode() {
    pythonStore.reloadPyodide();
}

onBeforeMount(async function(){

    let rootNodeKey = route.query.rkey;

    if (!rootNodeKey) {
        let ret = await Request.get("/json/script/listRootNodes");
        let data = await ret.json();
        rootNodeKey = data[0];
    }

    let pluginKey = undefined;

    if (!pluginKey) {
        let ret = await Request.list("script", {
            group: "node",
            dataObj: {
                plugin: true
            }
        });

        let data = await ret.json();
        if (data)
        {
            pluginKey = data.skellist[0].key;
        }
    }

    if (!pluginKey) {
        console.error("No Importable directory found!");
        return;
    }

    async function download(key: string, group=['leaf', 'node']) {
        for (let i = 0; i<group.length; ++i) {
            const dataObj = {parententry: key};
            let resp = await Request.list("script", {
									group: group[i],
									dataObj: dataObj
								});

            let data = await resp.json();

            for (let j = 0; j<data.skellist.length; ++j) {
                if (group[i] === 'node') {
                    await download(data.skellist[j].key)
                }
                else {
                    const entry = data.skellist[j];

                    let directory_path = entry.path.substring(0,entry.path.lastIndexOf("/")+1);
                    directory_path = directory_path.slice(0, -1);

                    await pythonStore.py.write(directory_path, "/" + entry.name, entry.script);
                    console.log("Writing pythonStore ", directory_path, "/" + entry.name, entry.script)
                }
            }
        }
    }

    await download(pluginKey);
})

const run = function() {
    globalStore.setLoading(true);



    Request.view("script", route.params.key, {group: "leaf"}).then((answ: Response) => {
        answ.json().then(function (res) {
            //tabStore.addTab(key, res.values.name, res.values.script);

            pythonStore.runScript(res.values.script, res.values.name, route.params.key);

            globalStore.setLoading(false);

        });
    }).catch((e) => {
        globalStore.setLoading(false);
        //messageStore.addMessage("error", t("tree.select.item.title"), t("tree.select.item.description", {file: _entry.label}));
    })
}
</script>
<style>
.wrap {
    width: 100%;
    height: 95%;
}
</style>
