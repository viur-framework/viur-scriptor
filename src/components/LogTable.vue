<template>
	<div class="mydiv">
		<sl-scroll ref="myScrollBar" style='width:100%;height:350px;'  id="sl-scrollDIV"></sl-scroll>
	</div>
</template>


<script setup lang="ts">


import {onMounted, ref} from "vue";
import {SlScroll} from "@viur/viur-shoelace";

let myScrollBar = ref<SlScroll>();

onMounted(() => {
	const div = document.createElement("div");
	const result=document.createDocumentFragment();

	for(var i=0,j=500;i<j;i++){
		let html=document.createElement('div');
		html.textContent= (i+1)+' scroll div----->'+Math.random();
		result.appendChild(html);
		if(i>0&&i%100==0){
			html=document.createElement('div');
			html.style.width='900px';
			html.classList.add("mydiv")
			html.textContent=`<sl-alert variant="primary" open>`;
			result.appendChild(html);
		}
	}
	div.classList.add("mydiv")
	div.append(result);
	myScrollBar.value.appendChild(div);
	console.log("Hello!")
});

</script>

<style scoped>
.mydiv {
	padding-top: 30px;
	margin-top: 10px;
}
</style>
