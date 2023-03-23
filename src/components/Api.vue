<template>
  <div class="scroll">
  	<div class="bind">
	  <h1 class="headline coloured-headline">
		  User Modul
	  </h1>
	  <p class="paragraph">
		 Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
	  </p>

		<br>

	  <h2 class="headline coloured-headline underline-headline">Funktionen</h2>

		<div class="box" v-for="i in 5">
		  <h3 class="headline">PW Recovery</h3>
		  <p class="paragraph">
		   This implements the password recovery process which let them set a new password for their account
			  after validating a code send to them by email. The process is as following:<br>
			  - The user enters his email adress<br>
			  - We'll generate a random code, store it in his session and call sendUserPasswordRecoveryCode<br>
			  - sendUserPasswordRecoveryCode will run in the background, check if we have a user with that name
				and send the code. It runs as a deferredTask so we don't leak the information if a user account exists.<br>
			  - If the user received his code, he can paste the code and set a new password for his account.<br>
			  To prevent automated attacks, the fist step is guarded by a captcha and we limited calls to this function
			  to 10 actions per 15 minutes. (One complete recovery process consists of two calls)
		  </p>
		  <br>

		  <sl-details summary="Values">
			  <div class="value-wrap">
			<div class="value">
				<div class="value-info">
					<div class="name">Name des Value:</div>
					Test1234
				</div>
				<div class="value-info">
					<div class="name">Typ:</div>
					String
				</div>
				<div class="value-info">
					<div class="name">noch was:</div>
					noch was
				</div>
			</div>
			<div class="value">
				<div class="value-info">
					<div class="name">Name des Value:</div>
					Test1234
				</div>
				<div class="value-info">
					<div class="name">Typ:</div>
					String
				</div>
				<div class="value-info">
					<div class="name">noch was:</div>
					noch was
				</div>
			</div>
			<div class="value">
				<div class="value-info">
					<div class="name">Name des Value:</div>
					Test1234
				</div>
				<div class="value-info">
					<div class="name">Typ:</div>
					String
				</div>
				<div class="value-info">
					<div class="name">noch was:</div>
					noch was
				</div>
			</div>
		  </div>
		  </sl-details>
		</div>

	  <h2 class="headline coloured-headline underline-headline">Datenbankfelder</h2>

		<p>Hier Datenfelder ausgeben, wie vorher</p>
  	</div>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped lang="less">
.scroll{
  flex: 1;
  overflow-y: auto;
}

.headline{
  margin-top: 0;
}

.coloured-headline{
  color: @mainColor;
}

.underline-headline{
  padding-bottom: var(--sl-spacing-medium);
  border-bottom: 1px solid @mainColor;
}

.box{
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, .2);
  padding: 20px;
  margin-bottom: 40px;
  border-radius: var(--sl-border-radius-medium);
}

sl-details{
  &::part(header){
	padding: var(--sl-spacing-small) var(--sl-spacing-medium);
  }

  &::part(content){
	padding: var(--sl-spacing-small) var(--sl-spacing-medium);
  }

  &::part(prefix){
	display: none;
  }
}

.value-wrap{
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-gap: 20px;
}

.value{
  display: flex;
  flex-direction: column;
  font-size: .9em;
}

.value-info{
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #ddd;

  &:first-child{
	border-top: 1px solid #ddd;
	padding-top: 8px;
  }
}

.name{
  font-weight: bold;
  width: 120px;
  margin-right: 10px;
}
</style>
