<sl-tab-group class="tabs-closable">
	<sl-tab v-for="(tab, key) in tabStore.tabMap" slot="nav" :panel="key" :key="key" closeable>
		{{ tab.name }}
	</sl-tab>

	<sl-tab-panel v-for="(tab, key) in tabStore.tabMap" :name="key" :key="key">
		<sl-split-panel class="side-split" vertical >
			<div slot="start" class="split-top">
				<CodeEditor/>
			</div>
			<div slot="end" class="split-bottom">
				<ul v-if="error.length <= 0" class="logging">
					<div v-for="entry in log">
						<div>
						<li class="alert-print">
							<sl-alert class="alert-print" :variant="entry.level" open>
								<sl-icon class="log-child" slot="icon" name="info-circle"></sl-icon>
								<div v-if="entry.json">
									<vue-json-pretty :data="entry.value" :deep="1" :showDoubleQuotes="false" :showIcon="true" :showLine="false" />
								</div>
								<div v-else>
									<pre class="alert-child log-child log-child-text">
									<code>
										{{ entry['value'] }}
									</code>
								</pre>
								</div>
							</sl-alert>

						</li>
						</div>
					</div>
				</ul>
				<div v-else class="logging">
					<sl-alert class="danger-print" variant="danger" open>
						<pre class="error-format">{{ error }}</pre>
					</sl-alert>
				</div>
			</div>
		</sl-split-panel>
  </sl-tab-panel>

</sl-tab-group>

