"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 *
 * This is a sketch to make resource creation and management easier.
 *
 * status: ALPHA
 */
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var SynthDefCompiler_1 = tslib_1.__importDefault(require("../lang/SynthDefCompiler"));
var resolveOptions_1 = tslib_1.__importDefault(require("../utils/resolveOptions"));
var node_watcher_1 = require("./node-watcher");
var msg = tslib_1.__importStar(require("./osc/msg"));
var server_1 = tslib_1.__importDefault(require("./server"));
var options_1 = require("./options");
/**
 * scsynth Group
 *
 * See `server.group(...)`
 */
var Group = /** @class */ (function () {
    function Group(server, id) {
        this.id = id;
        this.server = server;
    }
    /**
     * Stop the Group and remove it from the play graph on the server.
     */
    Group.prototype.free = function () {
        this.server.send.msg(msg.nodeFree(this.id));
        return node_watcher_1.whenNodeEnd(this.server, String(this.id), this.id);
    };
    /**
     * Update control parameters on the Synth.
     *
     * @example
     * ```js
     * synth.set({freq: 441, amp: 0.9});
     * ```
     *
     * This method works for Group and Synth.
     * For a Group it sends the set message to all children Synths
     * in the Group.
     */
    Group.prototype.set = function (settings) {
        this.server.send.msg(msg.nodeSet(this.id, settings));
    };
    return Group;
}());
/**
 * scsynth Synth
 *
 * See `server.synth(...)`
 */
var Synth = /** @class */ (function (_super) {
    tslib_1.__extends(Synth, _super);
    function Synth() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Synth;
}(Group));
/**
 * scsynth audio bus

 * See `server.audioBus(...)`
 *
 * These bus numbers (ids) and numChannels are allocated here in the client.
 * The server only gets bus ids for reading and writing to.
 */
var AudioBus = /** @class */ (function () {
    function AudioBus(server, id, numChannels) {
        this.server = server;
        this.id = id;
        this.numChannels = numChannels;
    }
    /**
     * Deallocate the AudioBus, freeing it for resuse.
     */
    AudioBus.prototype.free = function () {
        this.server.state.freeAudioBus(this.id, this.numChannels);
    };
    return AudioBus;
}());
/**
 * scsynth control bus

 * See `server.controlBus(...)`
 *
 * These bus numbers (ids) and numChannels are allocated here in the client.
 * The server only gets bus ids for reading and writing to.
 */
var ControlBus = /** @class */ (function (_super) {
    tslib_1.__extends(ControlBus, _super);
    function ControlBus() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Deallocate the ControlBus, freeing it for resuse.
     */
    ControlBus.prototype.free = function () {
        this.server.state.freeControlBus(this.id, this.numChannels);
    };
    return ControlBus;
}(AudioBus));
/**
 * scsynth Buffer
 *
 * See `server.buffer(...)` and `server.readBuffer(...)`
 */
var Buffer = /** @class */ (function () {
    function Buffer(server, id, numFrames, numChannels) {
        this.server = server;
        this.id = id;
        this.numFrames = numFrames;
        this.numChannels = numChannels;
    }
    /**
     * Deallocate the Buffer, freeing memory on the server.
     */
    Buffer.prototype.free = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.server.callAndResponse(msg.bufferFree(this.id))];
                    case 1:
                        _a.sent();
                        this.server.state.freeBuffer(this.id, this.numChannels);
                        return [2 /*return*/];
                }
            });
        });
    };
    return Buffer;
}());
/**
 * scsynth SynthDef
 *
 * See `server.synthDefs(...)`
 *
 * These are currently compiled using sclang,
 * and the synthDefResult holds metadata about the compiled
 * synthdef and the raw compiled bytes.
 *
 * The SynthDef may have been compiled from a sourceCode string
 * or compiled from a file at path.
 */
var SynthDef = /** @class */ (function () {
    function SynthDef(server, defName, synthDefResult, sourceCode, path) {
        this.server = server;
        this.name = defName;
        this.synthDefResult = synthDefResult;
        this.sourceCode = sourceCode;
        this.path = path;
        // SynthDefCompiler will watch the path
    }
    return SynthDef;
}());
/**
 * Supplied to synthDefs
 */
// interface SynthDefsArgs {
//   [defName: string]: {
//     source?: string;
//     path?: string;
//   };
// }
/**
 * This extends Server with convienient methods for creating Synth, Group, compiling SynthDefs, creating Buses, Buffers etc.
 *
 * All methods return Promises, and all arguments accept Promises.
 * This means that async actions (like starting a sclang interpreter,
 * compiling SynthDefs and sending them to the server) are complete and their results
 * are ready to be used by whatever they have been supplied to.
 */
var ServerPlus = /** @class */ (function (_super) {
    tslib_1.__extends(ServerPlus, _super);
    function ServerPlus() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Create a Synth on the server
     */
    ServerPlus.prototype.synth = function (synthDef, args, group, addAction) {
        if (args === void 0) { args = {}; }
        if (addAction === void 0) { addAction = msg.AddActions.TAIL; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, def, g, nodeId, sn;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([Promise.resolve(synthDef), Promise.resolve(group)])];
                    case 1:
                        _a = _b.sent(), def = _a[0], g = _a[1];
                        nodeId = this.state.nextNodeID();
                        sn = msg.synthNew(def.name, nodeId, addAction, g ? g.id : 0, args);
                        this.send.msg(sn);
                        return [4 /*yield*/, node_watcher_1.whenNodeGo(this, String(nodeId), nodeId)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, new Synth(this, nodeId)];
                }
            });
        });
    };
    // grainSynth with no id
    /**
     * Create a Group on the server
     */
    ServerPlus.prototype.group = function (group, addAction) {
        if (addAction === void 0) { addAction = msg.AddActions.TAIL; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var g, nodeId, sn;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve(group)];
                    case 1:
                        g = _a.sent();
                        nodeId = this.state.nextNodeID();
                        sn = msg.groupNew(nodeId, addAction, g ? g.id : 0);
                        this.send.msg(sn);
                        return [4 /*yield*/, node_watcher_1.whenNodeGo(this, String(nodeId), nodeId)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, new Group(this, nodeId)];
                }
            });
        });
    };
    Object.defineProperty(ServerPlus.prototype, "synthDefCompiler", {
        get: function () {
            if (!this._synthDefCompiler) {
                this._synthDefCompiler = new SynthDefCompiler_1.default();
            }
            return this._synthDefCompiler;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Compile multiple SynthDefs either from source or path.
     * If you have more than one to compile then always use this
     * as calling `server.synthDef` multiple times will start up
     * multiple supercollider interpreters. This is harmless, but
     * you do have a lot of icons bouncing in your dock.
     *
     * @param defs - An object with `{defName: spec, ...}` where spec is
     *               an object like `{source: "SynthDef('noise', { ...})"}`
     *               or `{path: "./noise.scd"}`
     * @returns An object with the synthDef names as keys and Promises as values.
     *                    Each Promise will resolve with a SynthDef.
     *                    Each Promises can be supplied directly to `server.synth()`
     */
    ServerPlus.prototype.synthDefs = function (defs) {
        var _this = this;
        var compiling = this.synthDefCompiler.boot().then(function () {
            return _this.synthDefCompiler.compileAndSend(defs, _this);
        });
        return lodash_1.default.mapValues(defs, function (requested, name) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var defsMap, result, sourceCode, synthDef;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, compiling];
                    case 1:
                        defsMap = _a.sent();
                        result = defsMap[name];
                        if (!result) {
                            new Error(name + " not found in compiled SynthDefs");
                        }
                        if (result.name !== name) {
                            throw new Error("SynthDef compiled as " + result.name + " but server.synthDefs was called with: " + name);
                        }
                        sourceCode = result.synthDesc.sourceCode;
                        synthDef = new SynthDef(this, result.name, result, sourceCode, "path" in requested ? requested.path : undefined);
                        return [2 /*return*/, synthDef];
                }
            });
        }); });
    };
    ServerPlus.prototype._compileSynthDef = function (defName, sourceCode, path) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var defs, synthDefResult;
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.synthDefCompiler.boot()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.synthDefCompiler.compileAndSend((_a = {},
                                _a[defName] = sourceCode ? { source: sourceCode } : { path: path },
                                _a), this)];
                    case 2:
                        defs = _b.sent();
                        synthDefResult = defs[defName];
                        if (!synthDefResult) {
                            throw new Error("SynthDefResult not found " + defName + " in compile return values");
                        }
                        return [2 /*return*/, new SynthDef(this, defName, synthDefResult, sourceCode, path)];
                }
            });
        });
    };
    /**
     * Load and compile a SynthDef from path and send it to the server.
     */
    ServerPlus.prototype.loadSynthDef = function (defName, path) {
        return this._compileSynthDef(defName, undefined, path);
    };
    /**
     * Compile a SynthDef from supercollider source code and send it to the server.
     */
    ServerPlus.prototype.synthDef = function (defName, sourceCode) {
        return this._compileSynthDef(defName, sourceCode);
    };
    /**
     * Allocate a Buffer on the server.
     */
    ServerPlus.prototype.buffer = function (numFrames, numChannels) {
        if (numChannels === void 0) { numChannels = 1; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var id;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = this.state.allocBufferID(numChannels);
                        return [4 /*yield*/, this.callAndResponse(msg.bufferAlloc(id, numFrames, numChannels))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, new Buffer(this, id, numFrames, numChannels)];
                }
            });
        });
    };
    /**
     * Allocate a Buffer on the server and load a sound file into it.
     *
     * Problem: scsynth uses however many channels there are in the sound file,
     * but the client (sclang or supercolliderjs) doesn't know how many there are.
     */
    ServerPlus.prototype.readBuffer = function (path, numChannels, startFrame, numFramesToRead) {
        if (numChannels === void 0) { numChannels = 2; }
        if (startFrame === void 0) { startFrame = 0; }
        if (numFramesToRead === void 0) { numFramesToRead = -1; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var id;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = this.state.allocBufferID(numChannels);
                        return [4 /*yield*/, this.callAndResponse(msg.bufferAllocRead(id, path, startFrame, numFramesToRead))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, new Buffer(this, id, numFramesToRead, numChannels)];
                }
            });
        });
    };
    /**
     * Allocate an audio bus.
     */
    ServerPlus.prototype.audioBus = function (numChannels) {
        if (numChannels === void 0) { numChannels = 1; }
        var id = this.state.allocAudioBus(numChannels);
        return new AudioBus(this, id, numChannels);
    };
    /**
     * Allocate a control bus.
     */
    ServerPlus.prototype.controlBus = function (numChannels) {
        if (numChannels === void 0) { numChannels = 1; }
        var id = this.state.allocControlBus(numChannels);
        return new ControlBus(this, id, numChannels);
    };
    return ServerPlus;
}(server_1.default));
exports.default = ServerPlus;
/**
 * Start the scsynth server with options:
 *
 * ```js
 *   let server = await sc.server.boot({device: 'Soundflower (2ch)'});
 * ```
 *
 * @memberof server
 *
 * @param options - Optional command line options for server
 * @param store - optional external Store to hold Server state
 */
function boot(options, store) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var opts, s;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resolveOptions_1.default(null, lodash_1.default.defaults(options, options_1.defaults))];
                case 1:
                    opts = _a.sent();
                    s = new ServerPlus(opts, store);
                    return [4 /*yield*/, s.boot()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, s.connect()];
                case 3:
                    _a.sent();
                    return [2 /*return*/, s];
            }
        });
    });
}
exports.boot = boot;
//# sourceMappingURL=ServerPlus.js.map