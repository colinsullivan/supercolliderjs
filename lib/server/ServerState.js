"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Immutable = tslib_1.__importStar(require("immutable"));
var Store_1 = tslib_1.__importDefault(require("./internals/Store"));
var alloc = tslib_1.__importStar(require("./internals/allocators"));
var node_watcher_1 = require("./node-watcher");
var StateKeys = {
    SERVERS: "SERVERS",
    NODE_IDS: "nodeAllocator",
    CONTROL_BUSSES: "controlBusAllocator",
    AUDIO_BUSSES: "audioBusAllocator",
    BUFFERS: "bufferAllocator",
};
/**
 * Holds state for a Server such as node/bus/buffer allocators,
 * node status and SynthDefs compiled.
 *
 * Server has this has as the property: server.state
 *
 * Many of these functions are low-level accessors and allocators
 * useful for building higher-level applications that are easier
 * to use.
 *
 * Each server is stored by its unique address,
 * so multiple Servers can store state in the same
 * global Store object.
 */
var ServerState = /** @class */ (function () {
    /**
     * @param {Server} server
     * @param {Store} store - optional parent Store to use.
     */
    function ServerState(server, store) {
        this.server = server;
        this.store = store || new Store_1.default();
        this.resetState();
        node_watcher_1.watchNodeNotifications(this.server);
    }
    ServerState.prototype.resetState = function () {
        var _this = this;
        this.store.mutateState(this._keys([]), function () {
            var _a;
            var options = _this.server.options;
            var numAudioChannels = options.numPrivateAudioBusChannels + options.numInputBusChannels + options.numOutputBusChannels;
            var ab = alloc.initialBlockState(numAudioChannels);
            ab = alloc.reserveBlock(ab, 0, options.numInputBusChannels + options.numOutputBusChannels);
            var cb = alloc.initialBlockState(options.numControlBusChannels);
            var bb = alloc.initialBlockState(options.numBuffers);
            return Immutable.Map((_a = {},
                _a[StateKeys.NODE_IDS] = options.initialNodeID - 1,
                _a[StateKeys.AUDIO_BUSSES] = ab,
                _a[StateKeys.CONTROL_BUSSES] = cb,
                _a[StateKeys.BUFFERS] = bb,
                _a));
        });
    };
    /**
     * Mutate a value or object in the server state.
     *
     * @param {String} key - top level key eg. nodeAllocator, controlBufAllocator
     * @param {Function} fn - will receive current state or an empty Map, returns the altered state.
     */
    ServerState.prototype.mutate = function (key, fn) {
        this.store.mutateState(this._keys([key]), fn);
    };
    /**
     * Get current state value for the server using an array of keys.
     *
     * @param {String} keys - list of keys eg. `['NODE_WATCHER', 'n_go', 1000]`
     * @param {any} notSetValue - default value to return if empty
     * @returns {any}
     */
    ServerState.prototype.getIn = function (keys, notSetValue) {
        return this.store.getIn(this._keys(keys), notSetValue);
    };
    /**
     * Allocates a node ID to be used for making a synth or group
     *
     * @returns {int}
     */
    ServerState.prototype.nextNodeID = function () {
        return this.store.mutateStateAndReturn(this._keys([StateKeys.NODE_IDS]), alloc.increment);
    };
    /**
     * Allocate an audio bus.
     *
     * @returns {int} bus number
     */
    ServerState.prototype.allocAudioBus = function (numChannels) {
        if (numChannels === void 0) { numChannels = 1; }
        return this._allocBlock(StateKeys.AUDIO_BUSSES, numChannels);
    };
    /**
     * Allocate a control bus.
     *
     * @returns {int} bus number
     */
    ServerState.prototype.allocControlBus = function (numChannels) {
        if (numChannels === void 0) { numChannels = 1; }
        return this._allocBlock(StateKeys.CONTROL_BUSSES, numChannels);
    };
    /**
     * Free a previously allocate audio bus
     *
     * These require you to remember the channels and it messes it up
     * if you free it wrong. will change to higher level storage.
     *
     * @param {int} index
     * @param {int} numChannels
     */
    ServerState.prototype.freeAudioBus = function (index, numChannels) {
        this._freeBlock(StateKeys.AUDIO_BUSSES, index, numChannels);
    };
    /**
     * Free a previously allocated control bus
     *
     * These require you to remember the channels and it messes it up
     * if you free it wrong. will change to higher level storage.
     *
     * @param {int} index
     * @param {int} numChannels
     */
    ServerState.prototype.freeControlBus = function (index, numChannels) {
        this._freeBlock(StateKeys.CONTROL_BUSSES, index, numChannels);
    };
    /**
     * Allocate a buffer id.
     *
     * Note that numChannels is specified when creating the buffer.
     * This allocator makes sure that the neighboring buffers are empty.
     *
     * @param {int} numConsecutive - consecutively numbered buffers are needed by VOsc and VOsc3.
     * @returns {int} - buffer id
     */
    ServerState.prototype.allocBufferID = function (numConsecutive) {
        if (numConsecutive === void 0) { numConsecutive = 1; }
        return this._allocBlock(StateKeys.BUFFERS, numConsecutive);
    };
    /**
     * Free a previously allocated buffer id.
     *
     * Note that numChannels is specified when creating the buffer.
     *
     * @param {int} index
     * @param {int} numConsecutive - consecutively numbered buffers are needed by VOsc and VOsc3.
     */
    ServerState.prototype.freeBuffer = function (index, numConsecutive) {
        this._freeBlock(StateKeys.BUFFERS, index, numConsecutive);
    };
    ServerState.prototype._allocBlock = function (key, numChannels) {
        return this.store.mutateStateAndReturn(this._keys([key]), function (state) { return alloc.allocBlock(state, numChannels); });
    };
    ServerState.prototype._freeBlock = function (key, index, numChannels) {
        this.mutate(key, function (state) { return alloc.freeBlock(state, index, numChannels); });
    };
    ServerState.prototype._keys = function (keys) {
        if (keys === void 0) { keys = []; }
        return [StateKeys.SERVERS, this.server.address].concat(keys);
    };
    return ServerState;
}());
exports.default = ServerState;
//# sourceMappingURL=ServerState.js.map