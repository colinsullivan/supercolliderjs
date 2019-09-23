"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/* eslint no-console: 0 */
var dryadic_1 = require("dryadic");
var fs_1 = tslib_1.__importStar(require("fs"));
var path_1 = tslib_1.__importDefault(require("path"));
var msg_1 = require("../server/osc/msg");
var StateKeys = {
    SYNTH_DEFS: "SYNTH_DEFS",
};
/**
 * Compile a SynthDef from sclang source code
 * or load a precompiled .scsyndef
 *
 * If compilation is required then it will insert SCLang as a parent if necessary.
 *
 *
 *
 * Note that the synthDefName is not known until after the source code is compiled.
 *
 */
var SCSynthDef = /** @class */ (function (_super) {
    tslib_1.__extends(SCSynthDef, _super);
    function SCSynthDef() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.properties = { watch: false };
        return _this;
    }
    /**
     * If there is no SCLang in the parent context,
     * then this will wrap itself in an SCLang (language interpreter).
     */
    SCSynthDef.prototype.requireParent = function () {
        if (this.properties.source || this.properties.compileFrom) {
            return "SCLang";
        }
    };
    SCSynthDef.prototype.prepareForAdd = function () {
        var _this = this;
        // search context for a SynthDefCompiler, else create one with context.lang
        return {
            updateContext: function (context, properties) { return ({
                synthDef: _this._prepareForAdd(context, properties),
            }); },
            callOrder: "SELF_THEN_CHILDREN",
        };
    };
    SCSynthDef.prototype._prepareForAdd = function (context, properties) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, result, lf, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!properties.source) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.compileSource(context, properties.source)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this._sendSynthDef(context, properties, result)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 3:
                        if (!properties.compileFrom) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.compileFrom(context, properties.compileFrom)];
                    case 4:
                        result = _a.sent();
                        return [4 /*yield*/, this._sendSynthDef(context, properties, result)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 6:
                        lf = properties.loadFrom;
                        if (!lf) return [3 /*break*/, 9];
                        result = {
                            name: path_1.default.basename(lf, path_1.default.extname(lf)),
                        };
                        if (!context.scserver) return [3 /*break*/, 8];
                        return [4 /*yield*/, context.scserver.callAndResponse(msg_1.defLoad(path_1.default.resolve(lf)))];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/, result];
                    case 9: throw new Error("Nothing specified for SCSynthDef: source|compileFrom|loadFrom");
                }
            });
        });
    };
    SCSynthDef.prototype._sendSynthDef = function (context, properties, result) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var buffer, promises;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // ! alters context
                        // name bytes
                        // synthDefName should be set for child context
                        if (!context.scserver) {
                            throw new Error("Missing scserver in context");
                        }
                        this.putSynthDef(context, result.name, result.synthDesc);
                        // you need to use a setter
                        context.synthDef = result;
                        buffer = new Buffer(result.bytes);
                        promises = [context.scserver.callAndResponse(msg_1.defRecv(buffer))];
                        if (properties.saveToDir) {
                            promises.push(this._writeSynthDef(result.name, buffer, result.synthDesc, properties.saveToDir));
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    SCSynthDef.prototype._writeSynthDef = function (name, buffer, synthDesc, saveToDir) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dir, pathname, descpath;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dir = path_1.default.resolve(saveToDir);
                        pathname = path_1.default.join(dir, name + ".scsyndef");
                        return [4 /*yield*/, fs_1.promises.writeFile(pathname, buffer)];
                    case 1:
                        _a.sent();
                        descpath = path_1.default.join(dir, name + ".json");
                        return [4 /*yield*/, fs_1.promises.writeFile(descpath, JSON.stringify(synthDesc, null, 2))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns a Promise for a SynthDef result object: name, bytes, synthDesc
     */
    SCSynthDef.prototype.compileSource = function (context, sourceCode, pathName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var wrappedCode;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                wrappedCode = "{\n      var def = { " + sourceCode + " }.value.asSynthDef;\n      (\n        name: def.name,\n        synthDesc: def.asSynthDesc.asJSON(),\n        bytes: def.asBytes()\n      )\n    }.value;";
                if (!context.sclang) {
                    throw new Error("Missing sclang in context: " + JSON.stringify(context));
                }
                return [2 /*return*/, context.sclang.interpret(wrappedCode, undefined, false, false, true).then(function (result) {
                        // JSONType
                        return result;
                    }, function (error) {
                        error.annotate("Failed to compile SynthDef  " + error.message + " " + (pathName || ""), {
                            properties: _this.properties,
                            sourceCode: sourceCode,
                        });
                        return Promise.reject(error);
                    })];
            });
        });
    };
    /**
     * Returns a Promise for a SynthDef result object: name, bytes, synthDesc
     */
    SCSynthDef.prototype.compileFrom = function (context, sourcePath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var source;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.readFile(path_1.default.resolve(sourcePath))];
                    case 1:
                        source = (_a.sent()).toString("ascii");
                        return [2 /*return*/, this.compileSource(context, source, sourcePath)];
                }
            });
        });
    };
    SCSynthDef.prototype.add = function () {
        var _this = this;
        return {
            run: function (context, properties) {
                if (properties.compileFrom && properties.watch) {
                    // should use updater here
                    context._watcher = fs_1.default.watch(path_1.default.resolve(properties.compileFrom), function () {
                        if (properties.compileFrom) {
                            _this.compileFrom(context, properties.compileFrom).then(function (result) {
                                _this._sendSynthDef(context, properties, result).catch(function (error) { return console.error(error); });
                            });
                        }
                    });
                }
            },
        };
    };
    SCSynthDef.prototype.remove = function () {
        return {
            scserver: {
                // no need to do this if server has gone away
                msg: function (context) {
                    if (context.synthDef) {
                        return msg_1.defFree(context.synthDef.name);
                    }
                },
            },
            run: function (context) {
                if (context._watcher) {
                    context._watcher.close();
                    delete context._watcher;
                }
            },
        };
    };
    SCSynthDef.prototype.putSynthDef = function (context, synthDefName, synthDesc) {
        context.scserver &&
            context.scserver.state.mutate(StateKeys.SYNTH_DEFS, function (state) {
                return state.set(synthDefName, synthDesc);
            });
    };
    /**
     * Return the value of this object, which is the synthDef: {name, bytes, synthDesc}
     * for use in /s_new.
     */
    SCSynthDef.prototype.value = function (context) {
        if (!context.synthDef) {
            throw new Error("No synthDef in context for SCSynthDef");
        }
        return context.synthDef;
    };
    return SCSynthDef;
}(dryadic_1.Dryad));
exports.default = SCSynthDef;
//# sourceMappingURL=SCSynthDef.js.map