import { map, atom, computed } from 'nanostores'
import { PyLog, PyInstallLog } from "./interfaces";

const pyLog = map<PyLog>({
  id: "",
  stdOut: [],
  stdErr: [],
  logging: [],
  exception: "",
});

const pyLogging = atom<Array<Object>>([]);
const pyDialogs = atom<Array<Object>>([]);

const pyInstallLog = map<PyInstallLog>({
  stage: 0,
  msg: "",
})

const pyExecState = atom(0);

const isPyReadyState = atom(0);

const isPyExecuting = computed(pyExecState, all => {
  return all === 1
})

const isPyReady = computed(isPyReadyState, all => {
  return all === 1
})
export { pyLog, pyDialogs, isPyExecuting, pyExecState, pyInstallLog, isPyReadyState, isPyReady, pyLogging }
