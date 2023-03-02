<template>
  <div class="data">

    <div class="data-name">{{props.details[0]}}</div>
    <div class="data-type">Typ: {{props.details[1].type}}</div>
    <div class="data-type">descr: {{props.details[1].descr}}</div>
    <code class="data-code">
      <vue-json-pretty :data="props.details" :deep="1" :showDoubleQuotes="false" :showIcon="true" :showLine="false" :collapsedOnClickBrackets="true" />

    </code>


  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

export default {
  props: {
    details: {
      type: Object,
      required: true
    }
  },
  components: {VueJsonPretty},
  name: "ModuleDetailsEntry",
  setup(props) {
    return {props}
  }
}
</script>

<style scoped lang="less">
.data{
  display: flex;
  flex-direction: column;
  padding: 15px;
}

.data-name{
  color: @mainColor;
  font-weight: bold;
  margin-bottom: 5px;
}

.data-type{
  margin-bottom: 10px;
  font-size: .9em;
}

.data-code{
  background-color: #f4f4f4;
  padding: 5px;
}
</style>