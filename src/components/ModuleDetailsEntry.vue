<template>
  <div class="data">

    <div class="data-name">{{props.details[0]}}</div>
    <div class="data-type">Typ: {{props.details[1].type}}</div>
    <div class="data-type">descr: {{props.details[1].descr}}</div>
    <code class="data-code">{{props.details[0]}}</code>


  </div>
</template>

<script>
export default {
  props: {
    details: {
      type: Object,
      required: true
    }
  },
  name: "ModuleDetailsEntry",
  setup(props) {

    console.log("props:", props.details)
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