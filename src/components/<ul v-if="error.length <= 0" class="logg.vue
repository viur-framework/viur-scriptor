<ul v-if="error.length <= 0" class="logging">
    <div v-bind="containerProps">
        <div v-bind="wrapperProps">
            <div 
              v-for="(entry, index) in virtList" 
              :key="index">
                <h2>{{index}}</h2>
                <h3>{{entry}}</h3>
            </div>
        </div>
    </div>
</ul>
<div v-else class="logging">
    <sl-alert class="danger-print" variant="danger" open>
        <pre class="error-format">{{ error }}</pre>
    </sl-alert>
</div>