<template>
    <div>{{ index }} - {{ source.text }}</div>
  </template>
  
  <script lang="ts">
    export default {
      name: 'item-component',
      props: {
        index: { // index of current item
          type: Number
        },
        source: { // here is: {uid: 'unique_1', text: 'abc'}
          type: Object,
          default () {
            return {}
          }
        }
        }
    }
  </script>