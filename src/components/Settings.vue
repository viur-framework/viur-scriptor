<script setup>
	import {useGlobalStore} from "@/stores/global";
	import {useI18n} from "vue-i18n";
	import {computed, ref, watch} from "vue";


	const store = useGlobalStore()
  const i18n  =useI18n();
	const t = i18n.t;

	const supportedLocales = i18n.availableLocales
  console.debug(supportedLocales)

	const dialogRef = ref(null)
	function show() {
		dialogRef.value.show();
	}

	function hide() {
		dialogRef.value.hide();
	}

	function autoSave() {
		store.setAutoSave(!store.shouldAutoSave); // toggle state here
	}

	const shouldAutoSave = computed(function() {
		return store.shouldAutoSave;
	})

  const autoSaveInterval = computed(function() {
		return store.autoSaveInterval / 60;
	})


	const language = computed(function() {
		return store.language;
	})

	watch(store.shouldAutoSave, (value, oldValue, onCleanup)=> { console.log(value)});
   	 const version =  __APP_VERSION__;

</script>

<template>
	<sl-button size="small"
				   @click="() => show()"
				   variant="white"
				   :title="t('settings.title')"
				   class="square-btn">
		<sl-icon name="system">
		</sl-icon>
	</sl-button>
	<sl-dialog ref="dialogRef" :label="t('settings.title')" class="dialog-focus">
		<sl-checkbox :checked="shouldAutoSave" @sl-change="autoSave">{{ t('settings.autosave') }}</sl-checkbox>
    <sl-input :label="t('settings.interval')" type="text" @input="(v) => store.setAutoSaveInterval(v.target.value * 60)" style="margin-top: 10px;margin-bottom:10px" :value=autoSaveInterval></sl-input>
      <sl-radio-group :label="t('settings.language')" :value="language" style="margin-top: 10px">
        <sl-radio-button v-for="(lang, index) in supportedLocales" :value="lang" style="margin-right: 5px" @click="() => store.setLanguage(lang)">{{ lang.toUpperCase() }}</sl-radio-button>
      </sl-radio-group>

		<sl-button slot="footer" variant="primary" @click="dialogRef.hide()">{{ t('close') }}</sl-button>
		<br> <div class="input--large"> Scriptor Version: {{version}}</div>

	</sl-dialog>



</template>

<style scoped lang="less">

</style>
