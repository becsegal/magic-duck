"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
Object.defineProperty(exports, "__esModule", { value: true });
const ChildProcess = __importStar(require("child_process"));
const REGISTER_TS_NODE_PATH = `${__dirname}/../../../register-ts-node`;
function fork(path) {
    let child = ChildProcess.fork(path, [], {
        execArgv: execArgs(),
    });
    // Terminate the child when ember-cli shuts down
    process.on('exit', () => child.kill());
    return child;
}
exports.default = fork;
function execArgs() {
    // If we're running in a TypeScript file, we need to register ts-node for the child too
    if (isTypeScript()) {
        return ['-r', REGISTER_TS_NODE_PATH];
    }
    else {
        return [];
    }
}
function isTypeScript() {
    return __filename.endsWith('.ts');
}
