import fs from 'fs';
import path from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as babel from '@babel/core';

function getType (): 'ts' | 'js' {
  return path.extname(config.entry) === '.ts' ? 'ts' : 'js';
}

const getModuleInfo = async (file: string) => {
  if (!path.extname(file)) file += getType() === 'ts' ? '.ts' : '.js';
  const body = fs.readFileSync(file, 'utf-8');
  const ast = parser.parse(body, {
    sourceType: 'module',
    plugins: getType() === 'ts' ? ['decorators-legacy', 'typescript'] : []
  });
  const dirname = path.dirname(file);
  const deps: {[key: string]: string} = {};
  traverse(ast, {
    ImportDeclaration ({ node }) {
      const relativeDir = node.source.value;
      const abspath = `./${path.join(dirname, relativeDir)}`;
      deps[relativeDir] = abspath;
    }
  });
  const { code } = await new Promise<babel.BabelFileResult>((resolve, reject) => {
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
  });
  return { file, code: code || '', deps };
};

const parseModule = async (entryPath: string) => {
  const a = [await getModuleInfo(entryPath)];
  const depGraph = { [a[0].file]: { deps: a[0].deps, code: a[0].code }};
  for (const { deps } of a) {
    await Promise.all(Object.values(deps).map(async (abspath) => {
      if (depGraph[abspath]) return;
      const info = await getModuleInfo(abspath);
      a.push(info);
      depGraph[abspath] = { code: info.code, deps: info.deps };
    }));
  }
  return depGraph;
};

const getBundle = async (entryPath: string) => {
  const depGraph = JSON.stringify(await parseModule(entryPath));
  return `;(function (graph) {
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
})(${depGraph});`;
};


type MyConfig = {
  entry: string;
  output: {
    path: string;
    filename: string
  }
}

const main = async (config: MyConfig) => {
  const code = await getBundle(config.entry);
  if (!fs.existsSync(config.output.path)) {
    fs.mkdirSync(config.output.path);
  }
  const outputPath = path.join(config.output.path, config.output.filename);
  fs.writeFileSync(outputPath, code);
};

const config: MyConfig = {
  entry: './src/index.ts',
  output: {
    path: './dist',
    filename: 'bundle_ts.js'
  }
};

main(config);
