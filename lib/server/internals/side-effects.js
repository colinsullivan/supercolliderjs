"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("../server");
var sclang_1 = require("../../lang/sclang");
/**
 * @private
 */
function bootServer(options, store) {
    return server_1.boot(options, store);
}
exports.bootServer = bootServer;
/**
 * @private
 */
function bootLang(options) {
    return sclang_1.boot(options);
}
exports.bootLang = bootLang;
/**
 * @private
 */
function sendMsg(context, msg) {
    return context.server.send.msg(msg);
}
exports.sendMsg = sendMsg;
/**
 * @private
 */
function nextNodeID(context) {
    return context.server.state.nextNodeID();
}
exports.nextNodeID = nextNodeID;
/**
 * @private
 */
function interpret(context, code) {
    return context.lang.interpret(code, undefined, false, false, true);
}
exports.interpret = interpret;
//# sourceMappingURL=side-effects.js.map