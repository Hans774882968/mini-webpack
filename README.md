### 主要知识点
1. babel读取代码的import语句
2. 算法：bfs遍历依赖图
3. 为浏览器定义一个`require`函数的polyfill
4. 算法：用**记忆化搜索**解决`require`函数的循环依赖问题

### Quick Start
```
npm install
npm run bundle
修改index.html依赖的js文件路径（bundle_ts.js），复制到dist文件夹，然后点击打开index.html。
```

### 依赖
```
npm i @babel/parser
npm i @babel/traverse
npm i -D @types/babel__traverse
npm i @babel/core @babel/preset-env
npm i -D @babel/preset-typescript
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

目前除了在nodejs代码里用`'@babel/preset-typescript'`插件以外，不知道怎么快速方便地编译`src`文件夹下的ts，只好手工修改`tsconfig.json`的`include`和`compilerOptions.module`。

### 读取单个文件
`getModuleInfo`函数。

1. 我们需要分析文件的`import`语句，把依赖的文件（相对路径）转换为相对于项目根目录的路径（下称“绝对路径”）。使用babel相关的库`@babel/parser`、`@babel/traverse`和`@babel/core`完成。
2. 在此读取了文件，因此可以顺便完成代码转换。用`@babel/core`完成，使用的是`transformFromAst`方法。

#### 如何支持typescript的编译
只需要修改`@babel/parser`的`parse`方法和`@babel/core`的`transformFromAst`方法的调用方式。需要用到`'@babel/preset-typescript'`这个插件。
```ts
const ast = parser.parse(body, {
  sourceType: 'module',
  plugins: getType() === 'ts' ? ['decorators-legacy', 'typescript'] : []
});

babel.transformFromAst(ast, undefined,
  getType() === 'ts' ?
    {
      presets: ['@babel/preset-typescript'],
      filename: file,
      plugins: ['@babel/plugin-transform-modules-commonjs']
    } :
    { presets: ['@babel/preset-env'] },
  (err, result) => {
    if (err) reject(err);
    resolve(result as babel.BabelFileResult);
  }
);
```

### 遍历依赖图
`parseModule`函数。依赖图需要是DAG，如果满足只需要bfs遍历一下，如果不满足则应该报错。

### 生成单个文件
`getBundle`函数。

为了在浏览器环境给出一个合法的`commonjs`的polyfill（这里只需要给出`require`和`exports`对象），我们定义了自己的`require`函数，其返回值为这个文件的`exports`对象，其副作用为把整个文件的代码执行了一遍。

```js
`;(function (graph) {
  var exportsInfo = {};
  function require (file) {
    if (exportsInfo[file]) return exportsInfo[file];
    function absRequire (relPath) {
      return require(graph[file].deps[relPath]);
    }
    var exports = {};
    exportsInfo[file] = exports;
    (function (require, exports, code) {
      eval(code);
    })(absRequire, exports, graph[file].code);
    return exports;
  }
  require('${entryPath}');
})(${depGraph});`
```

值得注意的是，这个`require`函数实际上是一个递归函数。在`eval(code)`时可能产生递归。

`depGraph`哈希表的一个对象的`deps`属性为什么设计为一个哈希表，而非直接设计为数组？因为待执行的代码中所有的路径都是相对路径，我们需要把它转换为绝对路径。为了完成这个转换，我们设计了`absRequire`函数，它只不过起到一个拦截器的作用。

#### 如何解决循环依赖
此时我们如果直接打包一个含有循环依赖的入口文件，会栈溢出。以最简单的情况为例：`a`模块的`a`函数引用`b`模块的`b`函数，`b`模块的`b`函数引用`a`模块的`a`函数。

怎么解决呢？根据参考链接3，我们可以用“记忆化搜索”的思路，开一个全局变量`var exportsInfo = {};`。并在`exports`对象生成以后，立即`exportsInfo[file] = exports;`。上文案例中，`b`模块获得的`a`模块的`exports`对象的值是空的，但因为对象的浅拷贝特性，**对象地址是正确的**，在`require`函数解析`a`模块完毕后，`b`模块也就能获得的`a`模块的`exports`对象的正确值了。

相信对acmer来说这个算法很经典，没有相关背景的话可以尝试在浏览器打断点帮助理解。

### 入口
在最开始读取配置（模仿`webpack.config.js`），在最后把`getBundle`生成的单个文件写入文件系统。

### 参考链接
1. 手写webpack核心原理，再也不怕面试官问我webpack原理：https://juejin.cn/post/6854573217336541192
2. `@babel/core`官方文档：https://runebook.dev/zh-CN/docs/babel/babel-core/index
3. webpack如何解决循环依赖：https://zhuanlan.zhihu.com/p/141863544