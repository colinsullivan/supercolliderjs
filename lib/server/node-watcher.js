"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * Functions for watching scsynth's node lifecycle notifications.
 *
 * Node states and metadata are stored in server.state, so most
 * useful information can be retrieved from there.
 *
 * These functions here are for registering callbacks.
 *
 * @module node-watcher
 *
 */
var immutable_1 = require("immutable");
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var Key;
(function (Key) {
    Key["NODE_WATCHER"] = "NODE_WATCHER";
    Key["NODES"] = "NODES";
    Key["CALLBACKS"] = "CALLBACKS";
    Key["ON_NODE_GO"] = "ON_NODE_GO";
    Key["ON_NODE_END"] = "ON_NODE_END";
})(Key || (Key = {}));
/**
 * Watch server OSC receive for any n_XXX messages:
 *
 * - `n_go`
 * - `n_end`
 * - `n_on`
 * - `n_off`
 * - `n_move`
 * - `n_info`
 *
 * Save all of the supplied info for the node
 * and call any registered callbacks.
 *
 * Initially there is no need to unwatch unless you are
 * creating and discarding Server objects which can happen
 * during testing.
 *
 * TODO: add Server.destroy
 *
 * @param {Server} server
 * @returns {Rx.Disposable} - sub.dispose(); to turn it off.
 */
function watchNodeNotifications(server) {
    // n_go
    // n_end
    // n_on
    // n_off
    // n_move
    // n_info
    var re = /^\/n_(go|end|on|off|move|info)$/;
    var stream = server.receive.filter(function (msg) { return !!msg[0].match(re); });
    var dispose = stream.subscribe(function (msg) {
        var cmd = msg[0];
        var r = _responders[cmd];
        if (r) {
            r(server, msg.slice(1));
        }
    });
    return dispose;
}
exports.watchNodeNotifications = watchNodeNotifications;
/**
 * Call a function when the server sends an `/n_go` message
 * One callback allowed per id and node
 * The id is usually a context id but could be a random guid
 *
 * @param {Server} server
 * @param {String} id - unique id for this callback registration
 * @param {int} nodeID
 * @param {Function} handler
 * @returns {Function} - cancel function
 */
function onNodeGo(server, id, nodeID, handler) {
    return _registerHandler(Key.ON_NODE_GO, server, id, nodeID, handler);
}
exports.onNodeGo = onNodeGo;
/**
 * Returns a Promise that resolves when the server sends an
 * `/n_go` message.
 *
 * The id is usually a context id (dryadic) but could be any random guid.
 * It can be anything you want to supply as long as it is unique.
 *
 * @param {Server} server
 * @param {String} id - unique id for this callback registration
 * @param {int} nodeID
 * @returns {Promise} - resolves with nodeID
 */
function whenNodeGo(server, id, nodeID) {
    return new Promise(function (resolve) {
        onNodeGo(server, id, nodeID, function () { return resolve(nodeID); });
    });
}
exports.whenNodeGo = whenNodeGo;
/**
 * Call a function when the server sends an `/n_end` message
 * One callback allowed per id and node.
 *
 * @param {Server} server
 * @param {String} id - unique id for this callback registration
 * @param {int} nodeID
 * @param {Function} handler
 * @returns {Function} - cancel function
 */
function onNodeEnd(server, id, nodeID, handler) {
    return _registerHandler(Key.ON_NODE_END, server, id, nodeID, handler);
}
exports.onNodeEnd = onNodeEnd;
/**
 * Returns a Promise that resolves when the server sends an `/n_end` message.
 *
 * The id is usually a context id but could be a random guid
 */
function whenNodeEnd(server, id, nodeID) {
    return new Promise(function (resolve) {
        onNodeEnd(server, id, nodeID, function () { return resolve(nodeID); });
    });
}
exports.whenNodeEnd = whenNodeEnd;
// function disposeForId(server:Server, id) {
//   // remove all by matching the context id
//   throw new Error('Not Yet Implemented');
// }
/**
 * Update values in the Server's node state registery.
 *
 * This is for internal use.
 */
function updateNodeState(server, nodeID, nodeState) {
    // unless its n_end then delete
    server.state.mutate(Key.NODE_WATCHER, function (state) {
        return state.mergeIn([Key.NODES, String(nodeID)], immutable_1.Map(), nodeState);
    });
}
exports.updateNodeState = updateNodeState;
/**
 * @private
 */
function _registerHandler(type, server, id, nodeID, handler) {
    var dispose = function () {
        _disposeHandler(type, server, id, nodeID);
    };
    server.state.mutate(Key.NODE_WATCHER, function (state) {
        var _a, _b;
        var handlerId = id + ":" + nodeID;
        return state
            .mergeDeep((_a = {},
            _a[Key.CALLBACKS] = (_b = {},
                _b[handlerId] = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    if (type === Key.ON_NODE_GO || type === Key.ON_NODE_END) {
                        dispose();
                    }
                    handler.apply(null, args);
                },
                _b),
            _a))
            .updateIn([type, String(nodeID)], immutable_1.List(), function (list) { return list.push(handlerId); });
    });
    return dispose;
}
/**
 * Delete a handler from state object.
 *
 * @private
 */
function _disposeHandler(type, server, id, nodeID) {
    server.state.mutate(Key.NODE_WATCHER, function (state) {
        // why would I get undefined ??
        // probably no longer happens with new mutate
        // state = state || Map();
        var handlerId = id + ":" + nodeID;
        return state
            .deleteIn([Key.CALLBACKS, handlerId])
            .updateIn([type, String(nodeID)], immutable_1.List(), function (list) { return list.filter(function (hid) { return hid !== handlerId; }); });
    });
}
/**
 * @private
 */
function _handlersFor(server, type, nodeID) {
    return server.state.getIn([Key.NODE_WATCHER, type, String(nodeID)], immutable_1.List()).map(function (handlerId) {
        return server.state.getIn([Key.NODE_WATCHER, Key.CALLBACKS, handlerId], null);
    });
}
/**
 * @private
 */
function _saveNodeState(server, set, msg) {
    var nodeID = msg[0];
    var isGroup = msg[4] > 0;
    var nodeState = {
        parent: msg[1],
        previous: msg[2],
        next: msg[3],
        isGroup: isGroup,
        head: isGroup ? msg[5] : null,
        tail: isGroup ? msg[6] : null,
    };
    nodeState = lodash_1.default.assign(nodeState, set);
    updateNodeState(server, nodeID, nodeState);
}
/**
 * Call any handlers registered for n_XXX events.
 *
 * @private
 */
function _callNodeHandlers(server, eventType, nodeID) {
    _handlersFor(server, eventType, nodeID).forEach(function (h) { return h(nodeID); });
}
/**
 * @private
 */
var _responders = {
    "/n_go": function (server, args) {
        _saveNodeState(server, {
            isPlaying: true,
            isRunning: true,
        }, args);
        _callNodeHandlers(server, Key.ON_NODE_GO, args[0]);
    },
    "/n_end": function (server, args) {
        var nodeID = args[0];
        server.state.mutate(Key.NODE_WATCHER, function (state) {
            return state.deleteIn([Key.NODES, String(nodeID)]);
        });
        _callNodeHandlers(server, Key.ON_NODE_END, nodeID);
    },
    "/n_on": function (server, args) {
        _saveNodeState(server, {
            isRunning: true,
        }, args);
    },
    "/n_off": function (server, args) {
        _saveNodeState(server, {
            isRunning: false,
        }, args);
    },
    "/n_info": function (server, args) {
        _saveNodeState(server, {}, args);
    },
    "/n_move": function (server, args) {
        _saveNodeState(server, {}, args);
    },
};
//# sourceMappingURL=node-watcher.js.map