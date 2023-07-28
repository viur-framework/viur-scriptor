<template>
    <sl-drawer label="System Nachrichten"
               :open="messageStore.state['opened']"
               @sl-request-close="messageStore.state['opened']=false"
    >
        <message v-for="message in messageStore.state.messages"
                 :key="message['time']"
                 :variant="message['variant']"
                 :icon="message['icon']"
                 :time="message['time']"
                 :headline="message['headline']"
        >
            {{ message['body'] }}
        </message>
    </sl-drawer>

    <div class="messages_target">
        <message v-for="message in messageStore.state.messages.slice(0,1)"
                 :key="message['time']"
                 :variant="message['variant']"
                 :icon="message['icon']"
                 :headline="message['headline']"
                 :time="message['time']"
                 :duration="3000"
        > {{ message['body'] }}
        </message>
    </div>

</template>

<script lang="ts">
//@ts-nocheck
import {reactive, defineComponent} from 'vue'
import Message from "./Message.vue"
import {useMessageStore} from "../../stores/message";

export default defineComponent({
    props: {},
    components: {Message},
    setup(props, context) {
        const messageStore = useMessageStore()

        return {
            messageStore,
        }
    }
})
</script>

<style scoped lang="less">

.messages_target{
  position: absolute;
  width: 500px;
  left: 25px;
  bottom: 77px;
  z-index: 99;
}

sl-drawer{
  &::part(title){
	font-size: 1em;
	padding: var(--sl-spacing-medium) var(--header-spacing);
  }

  &::part(title){
	font-size: 1em;
	padding: var(--sl-spacing-medium) var(--header-spacing);
  }

  &::part(header) {
	box-shadow: 0 0 10px 0 rgba(0, 0, 0, .25);
  }

  &::part(header-actions){
	padding: 0;
  }

  &::part(close-button__base){
	font-size: 1em;
	padding: 0 var(--header-spacing);
  }
}
</style>
