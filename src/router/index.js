import {createRouter, createWebHashHistory} from 'vue-router'
import Home from '../components/Home.vue'
import Runner from '../views/Runner.vue'
import Alert from '../views/runner/Alert.vue'
import Confirm from '../views/runner/Confirm.vue'
import Input from '../views/runner/Input.vue'
import Select from '../views/runner/Select.vue'
import DiffCompare from '../views/runner/DiffCompare.vue'

import Interactions from '../views/Interactions.vue';

const routes = [
    {
        path: '/',
        redirect: '/home'
    },

    {
        path: '/home',
        name: 'Home',
        component: Home
    },

    {
        path: '/runner/:key',
        name: 'Runner',
        component: Runner
    },

    {
        path: '/interactions',
        name: 'Interactions',
        component: Interactions
    },

    {
        path: '/runner/alert',
        name: 'Alert',
        component: Alert
    },

    {
        path: '/runner/confirm',
        name: 'Confirm',
        component: Confirm
    },

    {
        path: '/runner/input',
        name: 'Input',
        component: Input
    },

    {
        path: '/runner/select',
        name: 'Select',
        component: Select
    },

    {
        path: '/runner/diffcompare',
        name: 'DiffCompare',
        component: DiffCompare
    }
]

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes
})

export default router
