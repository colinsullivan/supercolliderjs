"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
/**
 * A Store that holds a state tree. This is used by ServerState as
 * its immutable memory storage.
 *
 * Holds an Immutable.Map
 * and offers functions to mutate sub-states
 * in that tree, and stores the new state.
 *
 * https://facebook.github.io/immutable-js/docs/#/Map
 */
var Store = /** @class */ (function () {
    function Store() {
        this.state = immutable_1.Map();
    }
    Store.prototype.getIn = function (keys, notSetValue) {
        return this.state.getIn(keys, notSetValue);
    };
    /**
     * Fetch the object at keys
     * pass it to the function which mutates it and returns new sub state.
     */
    Store.prototype.mutateState = function (keys, fn) {
        this.state = this.state.updateIn(keys, immutable_1.Map(), fn);
    };
    /**
     * Fetch one part of the state,
     * mutate it with the callback,
     * which returns result, subState.
     * Save the subState back into state and return the result.
     *
     * @returns {any} result
     */
    Store.prototype.mutateStateAndReturn = function (keys, fn) {
        var _a = fn(this.state.getIn(keys, immutable_1.Map())), result = _a[0], subState = _a[1];
        this.state = this.state.setIn(keys, subState);
        return result;
    };
    return Store;
}());
exports.default = Store;
//# sourceMappingURL=Store.js.map