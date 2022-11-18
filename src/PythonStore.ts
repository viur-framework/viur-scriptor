import { defineStore } from 'pinia'
import { usePython} from "usepython";

export const usePythonStore = defineStore('python', () => {
	const py = usePython();


	return { py }
})
