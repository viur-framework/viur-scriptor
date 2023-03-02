<template>
	<div class="container">
		<div class="row">
			<h2 class="headline">General</h2>

			<pre v-highlightjs><code class="python">{{ "from scriptor.dialog import alert, confirn, input, select\n"}}</code></pre>
		</div>
		<div class="row">
			<h2 class="headline">Alerts</h2>

			<div class="item">
				<Alert :text="'Das ist eine Nachricht!'"></Alert>

				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>
					<pre v-highlightjs><code class="python">{{ "await alert('Das ist eine Nachricht')" }}</code></pre>
					
				</sl-details>
			</div>

		</div>


		<div class="row">
			<h2 class="headline">Confirm</h2>

			<div class="item">
				<Confirm title="Confirm" text="Willst du wirklich alle Einträge löschen? Das Löschen kann nicht wieder rückgängig gemacht werden." :select="confirmValue" :cancel=true></Confirm>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>
					<pre v-highlightjs><code class="python">result = await confirm("Willst du wirklich alle Einträge löschen? Das Löschen kann nicht wieder rückgängig gemacht werden.", allow_cancel=True)</code></pre>

				</sl-details>
			</div>
			<div class="item">
				<Confirm title="Confirm" text="Willst du wirklich alle Einträge löschen? Das Löschen kann nicht wieder rückgängig gemacht werden." :select="confirmValue" :cancel=false></Confirm>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>
					<pre v-highlightjs><code class="python">result = await confirm("Willst du wirklich alle Einträge löschen? Das Löschen kann nicht wieder rückgängig gemacht werden.")</code></pre>

				</sl-details>
			</div>
		</div>

		<div class="row">
			<h2 class="headline">Inputs</h2>

			<div class="item">
				<Input type="string" title="Input" text="type='string'" :select="confirmValue" :cancel=true></Input>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>
					<pre v-highlightjs><code class="python">result = await input.string("type='string'", empty=False)</code></pre>
				</sl-details>
			</div>
			<div class="item">
				<Input type="date" title="Input" text="type='date'" :select="confirmValue" :cancel=true></Input>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>
					<pre v-highlightjs><code class="python">result = await input.date("type='date'", empty=False)</code></pre>

				</sl-details>
			</div>
			<div class="item">
				<Input type="number" title="Input" text="type='number'" :select="confirmValue" :cancel=true></Input>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>
					<pre v-highlightjs><code class="python">result = await input.number("type='number'", empty=False)</code></pre>

				</sl-details>
			</div>
			<div class="item">
				<Input type="text" title="Input" text="type='text'" :select="confirmValue" :cancel=true></Input>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>
					<pre v-highlightjs><code class="python">result = await input.text("type='text'", empty=False)</code></pre>

				</sl-details>
			</div>
			<div class="item">
				<Input useTime=true type="date" title="Input" text="type='Date with use_time = true''" :select="confirmValue" :cancel=true></Input>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>
					<pre v-highlightjs><code class="python">result = await input.date("type='date'", use_time=True, empty=False)</code></pre>

				</sl-details>
			</div>
		</div>


		<div class="row">
			<h2 class="headline">Selects</h2>

			<div class="item">
				<Select :options="['A','B']" :multiple="false" text="Select (not multiple)" title="Select"></Select>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>
					<pre v-highlightjs><code class="python">{{ 'choices = ["A", "B"]\n' 
		+ 'ret = await select("Select (not multiple)", choices) '}}
</code></pre>

				</sl-details>
			</div>
			<div class="item">
				<Select :options="['A', 'B', 'C', 'D', 'E', 'T', 'G']" :multiple="true" text="Select (multiple)" title="Select"></Select>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>
					<pre v-highlightjs><code class="python">{{ "choices = ['A', 'B', 'C', 'D', 'E', 'T', 'G']\n"
		+ 'ret = await select("Select (multiple)", choices)'}}
</code></pre>
				</sl-details>
			</div>
		</div>

	</div>
</template>

<script setup lang="ts">
import Alert from "../components/Interaction/Alert.vue";
import Confirm from "../components/Interaction/Confirm.vue";
import Input from "../components/Interaction/Input.vue";
import Select from "../components/Interaction/Select.vue";

function confirmValue(value: String) {
	
}

</script>

<style scoped>

.container {
	overflow: auto;
}

.data-grid {
	display: grid;
	overflow-x: auto;
	grid-template-columns: repeat(5, 1fr);
	justify-content: space-between;
	grid-gap: 10px;
}

.row{
	width: 100%;
	padding: 20px;
	max-width: 1400px;
	margin: 0 auto;
}

sl-details {
	width: 100% !important;
	max-width: 100% !important;
	font-size: .9em;
}

.source-code{
	margin-top: 20px;
}

.item{
	background-color: var(--sl-color-neutral-200);
	padding: 10px;
	border-radius: 5px;
	margin-bottom: 20px;
}
</style>
