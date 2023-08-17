<template>
    <sl-card :disabled="!render" :class="!render ? 'disabled' : ''" class="interaction">
      <div v-if="imageURL" class="interaction-img">
            <img :src="imageURL"
            class="">
          </div>


        <div slot="header">
            {{ props.title }}
        </div>
    
        <p class="paragraph">
			    {{  props.text }}
		    </p>

        <div v-if="!props.multiple" class="data-grid" label="Alignment">
            <sl-button  :variant="selectedOption === index ? 'success' : 'default'" :disabled="!props.entry.render"
						size="medium"
						class="data-btn"
						v-for="(option, index) in Object.keys(props.options)"
						:key="option" @click="() => selectOption(option, index)"
            >
				    <img v-if="props.options[option].image !== undefined" :src="props.options[option].image"
						  class="data-btn-img"
						  slot="prefix">

            <template v-if="props.options[option].text">
               {{ props.options[option].text }}
            </template>
            <template v-else>
               {{ option }}
            </template>

            </sl-button>
        </div>

		<div class="checkbox-container" v-else>
			<template v-if="!isImageSelct">
        <sl-checkbox class="checkbox"
						 :disabled="!props.entry.render"
						 v-for="option in Object.keys(props.options)"
             :checked="props.entry.entries.includes(option)"
						 :key="option" @sl-change="(event) => selectRadioButton(event, option)">

               {{ option }}
           

            </sl-checkbox>
      </template>
      <template v-else>
          
        <div class="image-container">
          <template v-for="option in Object.keys(props.options)"  :key="option">

            <figure>
              <img :src="props.options[option].image" alt="Bild 1">
              <figcaption>{{ props.options[option].text }}</figcaption>
              <sl-checkbox 
              :disabled="!props.entry.render" 
              class="checkbox" 
              @sl-change="(event) => selectRadioButton(event, props.options[option].text)" 
              :checked="props.entry.entries.includes(props.options[option].text)">
              </sl-checkbox>
            </figure>


          </template>

          
          <!-- Weitere Bilder und Texte hier einfügen -->
        </div>


      </template>

		</div>

    		<div slot="footer" v-if="props.multiple">
		  <sl-button
				 size="small"
				 variant="success"
				 v-show="props.entry.render"
				 @click="send">
			  {{ t("send") }}
		  </sl-button>
		</div>

	

    </sl-card>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import { useI18n } from 'vue-i18n';
export interface Props {
    options: String[],
    multiple: boolean,
    text: String,
    title: String,
    select: Function,
    imageURL: String; 
    entry: {};
}


const isImageSelct = computed(function(){
  let arr = Object.keys(props.options); 

  for (let i = 0; i<arr.length; ++i)
  {
    if (props.options[arr[i]].image === undefined)
      return false;
  }

  return true;
})

const render = ref(true);
const props = defineProps<Props>();
const {t} = useI18n();

if (props.entry.entries === undefined)
  props.entry.entries = [];

if (props.entry.selectedOption === undefined)
  props.entry.selectedOption = -1;

const selectedOption = ref(props.entry.selectedOption);

function selectOption(index: number, _index: number) {

  if (!props.entry.render)
    return;


  props.entry.render = false;
  props.select(index);
  props.entry.selectedOption = _index;
  selectedOption.value = _index;
}

function selectRadioButton(event: UIEvent, index: string) {
  if (!props.multiple)
    return;

  if (!render.value)
    return;

  if (event.target.checked)
    props.entry.entries.push(index);
  else {
    const _index = props.entry.entries.indexOf(index);
    if (_index !== -1) {
      props.entry.entries.splice(_index, 1);
    }
  }
}

function send() {
  if (!props.multiple)
    return;

  if (!props.entry.render)
    return;

  props.entry.render = false;
  props.select([...props.entry.entries]);
}


</script>

<style scoped lang="less">
  .image-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }

  .image-container figure {
    width: calc(50% - 20px);
    margin: 10px;
    text-align: center;
  }

  .image-container img {
    width: 100%;
  }

.interaction-img{
	margin: -10px;
	display: flex;
	justify-content: center;
	align-items: center;
	width: calc(100% + 20px);
	height: 200px;
	margin-bottom: 20px;
	background-color: var(--sl-color-neutral-100);

	img{
	  object-fit: contain;
	  height: 100%;
	}
  }

  .disabled {
    opacity: 0.5;
  }
  .card-header {
    max-width: 450px;
  }

  .card-header [slot='header'] {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-header h3 {
    margin: 0;
  }

  .card-header sl-icon-button {
    font-size: var(--sl-font-size-medium);
  }

  .checkbox-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  	grid-gap: 20px;
	margin-bottom: 10px;
  }

  .checkbox {
	  min-width: 100px;
	  font-size: 1em;

	  &::part(base) {
		font-size: 1em;
	  }
  }

  .data-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 10px;
  }

  .data-btn{
	&::part(base){
	  justify-content: flex-start;
	  padding-left: 0;
	}

  &.active{
	&::part(base) {
	  color: var(--sl-color-primary-500);
	  border-color: var(--sl-color-primary-500)
	}
  }
}

.data-btn-img{
  height: 100%;
  width: auto;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-gap: 10px;
}

.column {
  grid-column: span 1 / -1;
}

</style>
