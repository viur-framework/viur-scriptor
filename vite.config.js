import path from "path";
import copy from 'rollup-plugin-copy'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import visualizer from 'rollup-plugin-visualizer'
import del from 'rollup-plugin-delete'
import mv from "rollup-plugin-mv";

// https://vitejs.dev/config/

const APPNAME = "scriptor"
export default defineConfig(({command, mode})=>{
	let conf = {
		css: {
			preprocessorOptions:{
				less: {
					additionalData:`@import "./src/style/app.less";`
				}
			}
		},
		plugins: [
			visualizer(
				{
					template:"network"
				}
			),
			copy({
				targets: [
					{
						src: path.join(__dirname, "index.html"),
						dest: path.join(__dirname, `${APPNAME}`)
					}
				],
				hook:"buildStart"
			}),

			copy({
				targets: [
					{
						src: path.join(path.dirname(require.resolve('@viur/viur-shoelace/dist/shoelace.js')), "assets"),
						dest: path.join(__dirname, 'public', 'static', APPNAME, "viur-shoelace")
					}
				]
			}),


			vue({
				template: {
					compilerOptions: {
						isCustomElement: tag => tag.startsWith('sl-')
					}
				}
			})
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src")
			}
		},
		build: {
			"outDir": `../../deploy`,
			"emptyOutDir":false,
			"assetsDir": `${APPNAME}`,
			"assetsInlineLimit": 0,
			"chunkSizeWarningLimit": 700,
			rollupOptions: {
				input:{
					index: path.resolve(__dirname, `${APPNAME}/index.html`),
				}
			}
		}
	}

	return conf
})
