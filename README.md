# ViUR Scriptor
A scripting enviroment for the ViUR Framework. 


## 	Development
Build the 'usepython' module:

- Switch to directory where 'usepython' is located:
```shell
cd src/usepython
```

- Build the library with the following command:
```shell
npm install
npm run build
```


Install the node modules:
```shell
cd ../../
npm install
```

Create the scriptor archiv: 
```shell
cd src/assets
python3 make.py
```

Run the development server: 

```shell
npm run dev -- --port=8081
```



## Build
To build the scriptor enter:

```shell
npm run build
```


## Dependencies
- [usepython](https://github.com/synw/usepython)
- [pyodide](https://github.com/pyodide/pyodide)
- [vue-json-pretty](https://github.com/leezng/vue-json-pretty)
- [viur-shoelace](https://github.com/viur-framework/viur-shoelace)
- [codemirror](https://github.com/codemirror/dev/)
- [pinia](https://github.com/vuejs/pinia)


## Built With
[![Vue][Vue.js]][Vue-url]


## License
Distributed under the MIT License. See `LICENSE` for more information.


[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/