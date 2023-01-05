											<ul>
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
											</ul>