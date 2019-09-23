"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var events_1 = require("events");
var rx_1 = require("rx");
var utils_1 = require("../osc/utils");
/**
 * Owned by the Server, this is an object that you call .msg or .bundle on
 * to send OSC.
 *
 * The Server subscribes to this and does the actual sending.
 * You may also subscribe to this for debugging, logging or entertainment purposes.
 */
var SendOSC = /** @class */ (function (_super) {
    tslib_1.__extends(SendOSC, _super);
    function SendOSC() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SendOSC.prototype.msg = function (message) {
        this.emit("msg", utils_1.makeMessage(message));
    };
    /**
     * bundle
     *
     * Note that in SuperCollider language a number is interpreted
     * as relative seconds from 'now'; here is is interpreted as a
     * unix timestamp. See deltaTimeTag
     *
     * @param {null|Number|Array|Date} time
     *   - null: now, immediately
     *   - Number: if less than 10000 then it is interpreted
     *       as number of seconds from now.
     *       It it is larger then it is interpreted as a unix timestamp in seconds
     *   - Array: `[secondsSince1900Jan1, fractionalSeconds]`
     *   - Date
     * @param {Array} packets - osc messages as `[address, arg1, ...argN]`
     *                        or sub bundles as `[{timetag: , packets: }, ...]`
     */
    SendOSC.prototype.bundle = function (time, packets) {
        if (typeof time === "number" && time < 10000) {
            time = utils_1.deltaTimeTag(time);
        }
        this.emit("bundle", utils_1.makeBundle(time, packets));
    };
    /**
     * Make NTP timetag array relative to the current time.
     *
     * @example:
     *
     *    server.send.bundle(server.send.deltaTimetag(1.0), [ ... msgs ]);
     *
     * @param {Number} delta
     * @param {Date} now - optional, default new Date
     */
    SendOSC.prototype.deltaTimeTag = function (delta, now) {
        // was just [number]
        return utils_1.deltaTimeTag(delta, now);
    };
    /**
     * Subscribe to monitor OSC messages and bundles sent.
     *
     * Events are: `{type: msg|bundle: payload: Array}`
     *
     * @returns {Rx.Disposable} - `thing.dispose();` to unsubscribe
     */
    SendOSC.prototype.subscribe = function (onNext, onError, onComplete) {
        var msgs = rx_1.Observable.fromEvent(this, "msg", function (msg) {
            return {
                type: "msg",
                payload: msg,
            };
        });
        var bundles = rx_1.Observable.fromEvent(this, "bundle", function (bundle) {
            return {
                type: "bundle",
                payload: bundle,
            };
        });
        var combo = msgs.merge(bundles);
        return combo.subscribe(onNext, onError, onComplete);
    };
    return SendOSC;
}(events_1.EventEmitter));
exports.default = SendOSC;
//# sourceMappingURL=SendOSC.js.map