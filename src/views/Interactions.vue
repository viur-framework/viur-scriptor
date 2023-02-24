<template>
	<div class="container">
		<div class="row">
			<h2 class="headline">Alerts</h2>

			<div class="item">
				<Alert :text="'Das ist eine Nachricht!'"></Alert>

				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>
				</sl-details>
			</div>

		</div>


		<div class="row">
			<h2 class="headline">Confirm</h2>

			<div class="item">
				<Confirm title="Artikeln löschen" text="Willst du wirklich alle Einträge löschen? Das Löschen kann nicht wieder rückgängig gemacht werden." :select="confirmValue" :cancel=true></Confirm>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>

				</sl-details>
			</div>
			<div class="item">
				<Confirm title="Artikeln löschen" text="Willst du wirklich alle Einträge löschen? Das Löschen kann nicht wieder rückgängig gemacht werden." :select="confirmValue" :cancel=false></Confirm>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>

				</sl-details>
			</div>
		</div>

		<div class="row">
			<h2 class="headline">Inputs</h2>

			<div class="item">
				<Input type="string" title="Zeichenkette" text="type='string'" :select="confirmValue" :cancel=true></Input>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>

				</sl-details>
			</div>
			<div class="item">
				<Input type="date" title="Datum" text="type='date'" :select="confirmValue" :cancel=true></Input>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>

				</sl-details>
			</div>
			<div class="item">
				<Input type="number" title="Nummer" text="type='number'" :select="confirmValue" :cancel=true></Input>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>

				</sl-details>
			</div>
			<div class="item">
				<Input type="text" title="Text" text="type='text'" :select="confirmValue" :cancel=true></Input>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>

				</sl-details>
			</div>
			<div class="item">
				<Input type="datetime-local" title="Time" text="type='text'" :select="confirmValue" :cancel=true></Input>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>

				</sl-details>
			</div>
		</div>


		<div class="row">
			<h2 class="headline">Inputs</h2>

			<div class="item">
				<Select :options="['wdwd','wdwdw', '342323232']" :multiple="false" text="A oder B" title="Select (not multiple)"></Select>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>

				</sl-details>
			</div>
			<div class="item">
				<Select :options="['A', 'B', 'C', 'D', 'E', 'T', 'G']" :multiple="true" text="A oder B" title="Select (multiple)"></Select>
				<sl-details summary="Source Code" class="source-code">
					<sl-icon name="code-slash" slot="prefix"></sl-icon>

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
	console.log("confirmValue:", value)
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
