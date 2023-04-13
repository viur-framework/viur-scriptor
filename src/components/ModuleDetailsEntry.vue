<template>
  <div class="data">

    <div class="data-name">{{props.details.descr}}</div>
    <div class="data-type">Typ: {{props.details.type}}</div>
    <div class="data-type">descr: {{props.details.descr}}</div>
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
    console.log("ModuleDetailsEntry",props.details);

    return {props}
  }
}
</script>

<style scoped lang="less">

.data-detail{
	  &::part(base){
		 overflow: hidden;
		border: none;
		box-shadow: none;
		border-radius: 0;
		font-size: .9em;
	   }
	  &::part(header){
		 padding: 15px;
		 box-shadow: 0 0 10px 0 rgba(0, 0, 0, .25);
		border-radius: 0;
	   }
	  &::part(prefix){
		 display: none;
	   }
	  &::part(content){
		 padding: 0;
	   }
  }
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