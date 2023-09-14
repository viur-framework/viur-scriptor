<template>
  <sl-card :class="'interaction'">
    <div slot="header">
      {{ props.title }}
    </div>


        <div ref="tableWrapper" class="wrap" @scroll="handleScroll">
        <sl-table-wrapper>
          <table>
              <thead>
                  <tr class="table-row">
                      <th v-if="selectable">
                          <sl-checkbox @sl-change="(ev) => selectEntry(ev, -1)" :checked="props.entry.mainSelected" :disabled="!props.entry.render" v-if="multiple"></sl-checkbox>

                      </th>
                      <th v-for="(column, index) in props.header" :key="index">
                          {{ column }}
                      </th>
                  </tr>
              </thead>

              <tbody>

                  <tr class="table-row" v-for="(row, index) in visibleRows" :key="index">

                      <td v-if="selectable">
                        <sl-checkbox @sl-change="(ev) => selectEntry(ev, index)" :checked="row.selected" :disabled="!props.entry.render"></sl-checkbox>
                      </td>

                      <td v-for="(value, index) in row" :key="index">{{ value }}
                      </td>
                  </tr>
              </tbody>
          </table>
        </sl-table-wrapper>


        </div>

    <sl-page-btn @sl-page-change="changePage" :total='selectedEntries.length ' :page-size='perPageCount' :value='props.entry.selectedPage'></sl-page-btn>



    <div slot="footer" v-if="props.selectable">
      <sl-button size="small" v-show="props.entry.render" variant="success" @click="send">
        {{ t("send") }}
      </sl-button>
    </div>
  </sl-card>
</template>

<script setup lang="ts">
  export interface Props {
    title: String;
    multiple: Boolean,
    header: String[],
    rows: String[],
    selectable: Boolean,
    sendEvent: Function,
    entry: {};
  }

  function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}


  import { ref, computed } from "vue";
  import { useI18n } from "vue-i18n";

  //const render = ref(true);
  const { t } = useI18n();
  const props = defineProps<Props>();

  if (props.entry.selectedEntries === undefined)
 {
      props.entry.selectedEntries = deepClone(props.rows);
      for (let i = 0; i<props.rows.length; ++i) {
        props.entry.selectedEntries[i].selected = false;
    }
    props.entry.selectedPage = 1;
    props.entry.mainSelected = false;
 }
  let selectedEntries = props.entry.selectedEntries;


  const changePage = function(ev){
    props.entry.selectedPage = ev.detail.value ;
  };


  const perPageCount = 100;

  const pageCount = computed(function(){
    return Math.ceil(selectedEntries.length / perPageCount);
  });

  const visibleRows = computed(function(){
    const offset = (props.entry.selectedPage-1) * perPageCount;
    console.log("offset", offset, props.entry.selectedPage);
    console.log("Min Value", Math.min(selectedEntries.length - offset, perPageCount));

    const delta = selectedEntries.length - offset;

    return selectedEntries.slice(offset, offset+Math.min(delta, perPageCount))
  })


  function selectEntry(ev, index: number) {
    index = (props.entry.selectedPage-1)*perPageCount + index;

    if (index === -1)
    {
      props.entry.mainSelected = ev.target.checked;

      if (props.multiple)
      {
        for (let i = 0; i<props.rows.length; ++i) {
          selectedEntries[i].selected = ev.target.checked;
        }
      }
    }
    else
    {
      if (ev.target.checked)
      {
        selectedEntries[index].selected = true;

        if (props.multiple)
        {
          let selectAll = true;
          for (let i = 0; i<props.rows.length; ++i) {
            if (!selectedEntries[i].selected)
            {
              selectAll = false;
              break;
            }
          }


          if (selectAll)
          {
          if (!props.entry.mainSelected)
          props.entry.mainSelected = true;
          }
        }
        else
        {
          for (let i = 0; i<props.rows.length; ++i) {
            if (i != index)
            {
             selectedEntries[i].selected = false;
            }
          }
        }
      }
      else
      {
        selectedEntries[index].selected = false;

        if (props.multiple)
        {
          if (props.entry.mainSelected)
          props.entry.mainSelected = false;
        }
      }
    }
  }

  function send()
  {
    if (!props.entry.render)
      return;

    // send selected data
    let selectIndexes = [];
    if (props.selectable)
    {

      for (let i = 0; i<props.rows.length; ++i) {
        if (selectedEntries[i].selected)
        {
          selectIndexes.push(i);
        }
      }
    }

    if (props.sendEvent)
      props.sendEvent(selectIndexes);

      props.entry.render = false;
  }

  //if (!props.selectable)
    //props.sendEvent([]);
</script>

<style scoped lang="less">

.wrap {
  max-height: 200px; /* Set the maximum height of the wrapper */
  max-width: 100%;
  overflow-y: auto; /* Add a vertical scrollbar when the content overflows */
}

  .interaction-img {
    margin: -10px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: calc(100% + 20px);
    height: 200px;
    margin-bottom: 20px;
    background-color: var(--sl-color-neutral-100);

    img {
      object-fit: contain;
      height: 100%;
    }
  }

  .container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

sl-table-wrapper {
  overflow-y: auto;
  max-height: auto;
}
sl-table {
  overflow-y: auto;
}
table {
  overflow-y: auto;
  max-height: auto;
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  text-align: left;
  padding: 8px;
  border: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}

tr:hover {
  background-color: #ddd;
}

tbody {
  max-height: 200px; /* Setze die maximale Höhe für den Body-Container */
  overflow-y: auto; /* Füge eine Scrollbar hinzu */
}

.sl-checkbox {
  margin: 0;
}


</style>
