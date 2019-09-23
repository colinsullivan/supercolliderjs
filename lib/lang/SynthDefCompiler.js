"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs_1 = tslib_1.__importDefault(require("fs"));
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var path_1 = tslib_1.__importDefault(require("path"));
var msg_1 = require("../server/osc/msg");
var sclang_1 = require("./sclang");
/**
 * Utility class to compile SynthDefs either from source code or by loading a path.
 *
 * Stores metadata, watches path for changes and can resend on change.
 * Can write compiled synthDefs to .scsyndef
 *
 * @ member of lang
 */
var SynthDefCompiler = /** @class */ (function () {
    function SynthDefCompiler(lang) {
        this.lang = lang;
        this.store = new Map();
    }
    SynthDefCompiler.prototype.boot = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.lang) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, sclang_1.boot()];
                    case 1:
                        _a.lang = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.lang];
                }
            });
        });
    };
    /**
     * Returns an object with each compiled synthdef
     * as a SynthDefResultType.
     */
    SynthDefCompiler.prototype.compile = function (defs) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var defsList, compiledDefs;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        defsList = lodash_1.default.toPairs(defs);
                        return [4 /*yield*/, Promise.all(lodash_1.default.map(defsList, function (_a) {
                                var defName = _a[0], spec = _a[1];
                                return _this._compileOne(defName, spec);
                            }))];
                    case 1:
                        compiledDefs = _a.sent();
                        return [2 /*return*/, lodash_1.default.fromPairs(lodash_1.default.map(compiledDefs, function (result) { return [result.name, result]; }))];
                }
            });
        });
    };
    /**
     * Compile SynthDefs and send them to the server.
     *
     * @returns a Promise for {defName: SynthDefResult, ...}
     */
    SynthDefCompiler.prototype.compileAndSend = function (defs, server) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var compiledDefs, commands;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.compile(defs)];
                    case 1:
                        compiledDefs = _a.sent();
                        commands = lodash_1.default.map(compiledDefs, function (_a) {
                            var name = _a.name;
                            return _this.sendCommand(name);
                        });
                        return [4 /*yield*/, Promise.all(commands.map(function (cmd) { return server.callAndResponse(cmd); }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, compiledDefs];
                }
            });
        });
    };
    SynthDefCompiler.prototype.set = function (defName, data) {
        this.store.set(defName, data);
        return data;
    };
    SynthDefCompiler.prototype.get = function (defName) {
        return this.store.get(defName);
    };
    SynthDefCompiler.prototype.allSendCommands = function () {
        var _this = this;
        var commands = [];
        this.store.forEach(function (value, defName) {
            commands.push(_this.sendCommand(defName));
        });
        return commands;
    };
    SynthDefCompiler.prototype.sendCommand = function (defName) {
        var data = this.get(defName);
        if (!data) {
            throw new Error("SynthDef not in store: " + defName);
        }
        var buffer = new Buffer(data.bytes);
        return msg_1.defRecv(buffer);
    };
    // sendAll(server) {
    //   return Promise.all(
    //     this.store.keys().map((defName) => this.send(defName, server))
    //   );
    // }
    //
    // send(defName:string, server:Server) {
    //   let data = this.get(defName);
    //   let buffer = new Buffer(data.bytes);
    //   let promises = [
    //     context.scserver.callAndResponse(defRecv(buffer))
    //   ];
    //
    // }
    SynthDefCompiler.prototype._compileOne = function (defName, spec) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                // path or source
                if ("source" in spec) {
                    return [2 /*return*/, this.compileSource(spec.source).then(function (result) {
                            _this.set(defName, result);
                            return result;
                        })];
                }
                // if watch then add a watcher
                if ("path" in spec) {
                    return [2 /*return*/, this.compilePath(spec.path).then(function (result) {
                            _this.set(result.name, result);
                            return result;
                        })];
                }
                throw new Error("Spec to SynthDefCompiler not recognized " + defName + " " + JSON.stringify(spec));
            });
        });
    };
    /**
     * Returns a Promise for a SynthDef result object: name, bytes, synthDesc
     */
    SynthDefCompiler.prototype.compileSource = function (sourceCode, pathName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var wrappedCode, result, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        wrappedCode = "{\n      var def = { " + sourceCode + " }.value.asSynthDef;\n      (\n        name: def.name,\n        synthDesc: def.asSynthDesc.asJSON(),\n        bytes: def.asBytes()\n      )\n    }.value;";
                        if (!this.lang) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.lang.interpret(wrappedCode, undefined, false, false, true)];
                    case 2:
                        result = _a.sent();
                        // force casting it to the expected type
                        return [2 /*return*/, result];
                    case 3:
                        error_1 = _a.sent();
                        error_1.annotate("Failed to compile SynthDef  " + error_1.message + " " + (pathName || ""), {
                            sourceCode: sourceCode,
                        });
                        throw error_1;
                    case 4: throw new Error("sclang interpreter is not present: " + this.lang);
                }
            });
        });
    };
    /**
     * Returns a Promise for a SynthDef result object: name, bytes, synthDesc
     */
    SynthDefCompiler.prototype.compilePath = function (sourcePath) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fs_1.default.readFile(path_1.default.resolve(sourcePath), function (err, fileBuf) {
                if (err) {
                    reject(err);
                }
                else {
                    // is it really just ascii ?
                    _this.compileSource(fileBuf.toString("ascii"), sourcePath).then(resolve, reject);
                }
            });
        });
    };
    return SynthDefCompiler;
}());
exports.default = SynthDefCompiler;
//# sourceMappingURL=SynthDefCompiler.js.map