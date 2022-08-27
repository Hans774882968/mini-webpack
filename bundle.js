"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const parser = __importStar(require("@babel/parser"));
const traverse_1 = __importDefault(require("@babel/traverse"));
const babel = __importStar(require("@babel/core"));
const getModuleInfo = (file) => __awaiter(void 0, void 0, void 0, function* () {
    if (!path_1.default.extname(file))
        file += '.js';
    const body = fs_1.default.readFileSync(file, 'utf-8');
    const ast = parser.parse(body, { sourceType: 'module' });
    const dirname = path_1.default.dirname(file);
    const deps = {};
    (0, traverse_1.default)(ast, {
        ImportDeclaration({ node }) {
            const relativeDir = node.source.value;
            const abspath = `./${path_1.default.join(dirname, relativeDir)}`;
            deps[relativeDir] = abspath;
        }
    });
    const { code } = yield new Promise((resolve, reject) => {
        babel.transformFromAst(ast, undefined, { presets: ['@babel/preset-env'] }, (err, result) => {
            if (err)
                reject(err);
            resolve(result);
        });
    });
    return { file, code: code || '', deps };
});
const parseModule = (entryPath) => __awaiter(void 0, void 0, void 0, function* () {
    const a = [yield getModuleInfo(entryPath)];
    const depGraph = { [a[0].file]: { deps: a[0].deps, code: a[0].code } };
    for (const { deps } of a) {
        yield Promise.all(Object.values(deps).map((abspath) => __awaiter(void 0, void 0, void 0, function* () {
            if (depGraph[abspath])
                return;
            const info = yield getModuleInfo(abspath);
            a.push(info);
            depGraph[abspath] = { code: info.code, deps: info.deps };
        })));
    }
    return depGraph;
});
const getBundle = (entryPath) => __awaiter(void 0, void 0, void 0, function* () {
    const depGraph = JSON.stringify(yield parseModule(entryPath));
    return `(function (graph) {
  function require(file) {
    function absRequire(relPath) {
      return require(graph[file].deps[relPath]);
    }
    var exports = {};
    (function (require,exports,code) {
      eval(code);
    })(absRequire,exports,graph[file].code);
    return exports;
  }
  require('${entryPath}');
})(${depGraph})`;
});
const main = (config) => __awaiter(void 0, void 0, void 0, function* () {
    const code = yield getBundle(config.entry);
    if (!fs_1.default.existsSync(config.output.path)) {
        fs_1.default.mkdirSync(config.output.path);
    }
    const outputPath = path_1.default.join(config.output.path, config.output.filename);
    fs_1.default.writeFileSync(outputPath, code);
});
const config = {
    entry: './src/index.js',
    output: {
        path: './dist',
        filename: 'bundle.js'
    }
};
main(config);
