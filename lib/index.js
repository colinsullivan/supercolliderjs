"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * @module supercolliderjs
 */
var server = tslib_1.__importStar(require("./server"));
var lang = tslib_1.__importStar(require("./lang"));
var map = tslib_1.__importStar(require("./map"));
var msg = tslib_1.__importStar(require("./server/osc/msg"));
var resolveOptions_1 = tslib_1.__importDefault(require("./utils/resolveOptions"));
var checkInstall_1 = tslib_1.__importDefault(require("./utils/checkInstall"));
var Errors_1 = require("./Errors");
var scapi_1 = tslib_1.__importDefault(require("./scapi"));
module.exports = {
    server: server,
    lang: lang,
    map: map,
    msg: msg,
    resolveOptions: resolveOptions_1.default,
    checkInstall: checkInstall_1.default,
    SCError: Errors_1.SCError,
    SCLangError: Errors_1.SCLangError,
    scapi: scapi_1.default,
    // @deprecated These were renamed
    sclang: lang,
    scsynth: server
};
//# sourceMappingURL=index.js.map