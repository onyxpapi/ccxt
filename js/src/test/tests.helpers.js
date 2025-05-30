// ----------------------------------------------------------------------------
/* eslint-disable max-classes-per-file */
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import ccxt from '../../ccxt.js';
import errorsHierarchy from '../base/errorHierarchy.js';
import { unCamelCase } from '../base/functions/string.js';
// js specific codes //
const DIR_NAME = fileURLToPath(new URL('.', import.meta.url));
process.on('uncaughtException', (e) => {
    throw new Error(exceptionMessage(e));
    // process.exit (1);
});
process.on('unhandledRejection', (e) => {
    if (e.message.includes('connection closed by remote server')) {
        // because of unbeknown reason, this error is happening somewhere in the middle of WS tests, and it's not caught by the try/catch block. so temporarily ignore it
        return;
    }
    throw new Error(exceptionMessage(e));
    // process.exit (1);
});
const AuthenticationError = ccxt.AuthenticationError;
const NotSupported = ccxt.NotSupported;
const ExchangeError = ccxt.ExchangeError;
const InvalidProxySettings = ccxt.InvalidProxySettings;
const ExchangeNotAvailable = ccxt.ExchangeNotAvailable;
const OperationFailed = ccxt.OperationFailed;
const OnMaintenance = ccxt.OnMaintenance;
// ############## detect cli arguments ############## //
const argv = process.argv.slice(2); // remove first two arguments (which is process and script path "js/src/test/test.js")
function filterArgvs(argsArray, needle, include = true) {
    return argsArray.filter((x) => (include && x.includes(needle)) || (!include && !x.includes(needle)));
}
function selectArgv(argsArray, needle) {
    const foundArray = argsArray.filter((x) => (x.includes(needle)));
    return foundArray.length ? foundArray[0] : undefined;
}
const argvs_filtered = filterArgvs(argv, '--', false);
const argvExchange = argvs_filtered[0];
const argvSymbol = selectArgv(argv, '/');
const argvMethod = selectArgv(argv, '()');
// #################################################### //
function getCliArgValue(arg) {
    return process.argv.includes(arg) || false;
}
// non-transpiled part, but shared names among langs
const fileParts = import.meta.url.split('.');
const EXT = fileParts[fileParts.length - 1];
const LANG = 'JS';
const ROOT_DIR = DIR_NAME + '/../../../';
const ENV_VARS = process.env;
const NEW_LINE = '\n';
const LOG_CHARS_LENGTH = 10000;
const PROXY_TEST_FILE_NAME = "proxies";
function dump(...args) {
    console.log(...args);
}
function jsonParse(elem) {
    return JSON.parse(elem);
}
function jsonStringify(elem) {
    return JSON.stringify(elem, (k, v) => (v === undefined ? null : v)); // preserve undefined values and convert them to null
}
function convertAscii(input) {
    return input; // stub for c#
}
function getTestName(str) {
    return str;
}
function ioFileExists(path) {
    return fs.existsSync(path);
}
function ioFileRead(path, decode = true) {
    const content = fs.readFileSync(path, 'utf8');
    return decode ? JSON.parse(content) : content;
}
function ioDirRead(path) {
    const files = fs.readdirSync(path);
    return files;
}
async function callMethodSync(testFiles, methodName, exchange, skippedProperties, args) {
    // empty in js
    return {};
}
async function callMethod(testFiles, methodName, exchange, skippedProperties, args) {
    // used for calling methods from test files
    return await testFiles[methodName](exchange, skippedProperties, ...args);
}
async function callExchangeMethodDynamically(exchange, methodName, args) {
    // used for calling actual exchange methods
    return await exchange[methodName](...args);
}
function callExchangeMethodDynamicallySync(exchange, methodName, args) {
    throw new Error("This function shouldn't be called, only async functions apply here");
}
async function callOverridenMethod(exchange, methodName, args) {
    // needed in PHP here is just a bridge
    return await callExchangeMethodDynamically(exchange, methodName, args);
}
function exceptionMessage(exc) {
    return '[' + exc.constructor.name + '] ' + exc.stack.slice(0, LOG_CHARS_LENGTH);
}
// stub for c#
function getRootException(exc) {
    return exc;
}
function exitScript(code = 0) {
    process.exit(code);
}
function getExchangeProp(exchange, prop, defaultValue = undefined) {
    return (prop in exchange) ? exchange[prop] : defaultValue;
}
function setExchangeProp(exchange, prop, value) {
    exchange[prop] = value;
    exchange[unCamelCase(prop)] = value;
}
function initExchange(exchangeId, args, isWs = false) {
    if (isWs) {
        return new (ccxt.pro)[exchangeId](args);
    }
    return new (ccxt)[exchangeId](args);
}
async function importTestFile(filePath) {
    // eslint-disable-next-line global-require, import/no-dynamic-require, no-path-concat
    return (await import(pathToFileURL(filePath + '.js')))['default'];
}
function getTestFilesSync(properties, ws = false) {
    // empty in js
    return {};
}
async function getTestFiles(properties, ws = false) {
    const path = ws ? DIR_NAME + '../pro/test/' : DIR_NAME;
    // exchange tests
    const tests = {};
    const finalPropList = properties.concat([PROXY_TEST_FILE_NAME, 'features']);
    for (let i = 0; i < finalPropList.length; i++) {
        const name = finalPropList[i];
        const filePathWoExt = path + 'Exchange/test.' + name;
        if (ioFileExists(filePathWoExt + '.' + EXT)) {
            // eslint-disable-next-line global-require, import/no-dynamic-require, no-path-concat
            tests[name] = await importTestFile(filePathWoExt);
        }
    }
    // errors tests
    const errorHierarchyKeys = Object.keys(errorsHierarchy);
    for (let i = 0; i < errorHierarchyKeys.length; i++) {
        const name = errorHierarchyKeys[i];
        const filePathWoExt = path + '/base/errors/test.' + name;
        if (ioFileExists(filePathWoExt + '.' + EXT)) {
            // eslint-disable-next-line global-require, import/no-dynamic-require, no-path-concat
            tests[name] = await importTestFile(filePathWoExt);
        }
    }
    return tests;
}
function setFetchResponse(exchange, mockResponse) {
    exchange.fetch = async (url, method = 'GET', headers = undefined, body = undefined) => mockResponse;
    return exchange;
}
function isNullValue(value) {
    return value === null;
}
async function close(exchange) {
    await exchange.close();
}
function isSync() {
    return false;
}
function getRootDir() {
    return ROOT_DIR;
}
function getEnvVars() {
    return ENV_VARS;
}
function getLang() {
    return LANG;
}
function getExt() {
    return EXT;
}
export { 
// errors
AuthenticationError, NotSupported, ExchangeError, InvalidProxySettings, ExchangeNotAvailable, OperationFailed, OnMaintenance, 
// shared
getCliArgValue, 
//
dump, jsonParse, jsonStringify, convertAscii, ioFileExists, ioFileRead, ioDirRead, callMethod, callMethodSync, callExchangeMethodDynamically, callExchangeMethodDynamicallySync, callOverridenMethod, exceptionMessage, getRootException, exitScript, getExchangeProp, setExchangeProp, initExchange, getTestFiles, getTestFilesSync, setFetchResponse, isNullValue, close, getRootDir, argvExchange, argvSymbol, argvMethod, isSync, LANG, ENV_VARS, NEW_LINE, EXT, getEnvVars, getLang, getExt };
export default {};
