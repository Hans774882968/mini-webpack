### 依赖
```
npm i @babel/parser
npm i @babel/traverse
npm i -D @types/babel__traverse
npm i @babel/core @babel/preset-env
npm i -D @types/babel__core
npm i -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm i typescript@4.7.4
```

配置`eslint`后记得重启一下vscode，IDE提示才会生效。

### 初始化
```
npm init
tsc --init
```

`tsconfig.json`主要需要设置：
```json
"compilerOptions": {
  "module": "commonjs",
},
"include": [
  "bundle.ts"
]
```

这样才能用`tsc`命令编译入口文件。

接下来给`package.json`一个命令：`"bundle": "tsc && node bundle.js"`

以后可以直接`npm run bundle`模拟打包命令。

### 读取单个文件
`getModuleInfo`函数。

1. 我们需要分析文件的`import`语句，把依赖的文件（相对路径）转换为相对于项目根目录的路径（下称“绝对路径”）。使用babel相关的库`@babel/parser`、`@babel/traverse`和`@babel/core`完成。
2. 在此读取了文件，因此可以顺便完成代码转换。用`@babel/core`完成。

### 遍历依赖图
`parseModule`函数。依赖图需要是DAG，如果满足只需要bfs遍历一下，如果不满足则应该报错。

### 生成单个文件
`getBundle`函数。

### 入口
在最开始读取配置（模仿`webpack.config.js`），在最后把`getBundle`生成的单个文件写入文件系统。

### 参考链接
1. 手写webpack核心原理，再也不怕面试官问我webpack原理：https://juejin.cn/post/6854573217336541192
2. babel官方文档：https://runebook.dev/zh-CN/docs/babel/babel-core/index