"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/* jslint node: true */
var cuid_1 = tslib_1.__importDefault(require("cuid"));
var dgram_1 = tslib_1.__importDefault(require("dgram"));
var events_1 = tslib_1.__importDefault(require("events"));
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var osc_min_1 = tslib_1.__importDefault(require("osc-min"));
var Errors_1 = require("./Errors");
var logger_1 = tslib_1.__importDefault(require("./utils/logger"));
/*
 *
 *  Communicates via OSC with the SuperCollider API quark
 *
 *  The 'API' quark implements a two-way communication protocol.
 *  This nodejs code implements the other end of that communcation.
 *
 *  It connects with an sclang process using UDP OSC
 *  and then sends OSC messages to '/API/call'
 *
 *  Sent messages return a promise,
 *  the responses are received here from sclang
 *  and the promises are resolved
 *  (or rejected if there was an error).
 *
 *  Start SuperCollider
 *  Install the API quark ( > 2.0 )
 *  Activate the OSC responders in supercollider:
 *    API.mountDuplexOSC
 *
 *  See examples/call-api-from-node.js
 */
var SCAPI = /** @class */ (function (_super) {
    tslib_1.__extends(SCAPI, _super);
    function SCAPI(schost, scport) {
        if (schost === void 0) { schost = "localhost"; }
        if (scport === void 0) { scport = 57120; }
        var _this = _super.call(this) || this;
        _this.requests = {};
        _this.schost = schost;
        _this.scport = scport;
        _this.requests = {};
        _this.log = new logger_1.default(true, false);
        return _this;
    }
    SCAPI.prototype.connect = function () {
        var _this = this;
        this.udp = dgram_1.default.createSocket("udp4");
        this.udp.on("message", function (msgbuf) {
            var msg = osc_min_1.default.fromBuffer(msgbuf);
            if (msg.address === "/API/reply") {
                return _this.receive("reply", msg);
            }
            return _this.receive("scapi_error", msg);
        });
        this.udp.on("error", function (e) {
            _this.emit("error", e);
            _this.log.err("ERROR:" + e);
        });
    };
    SCAPI.prototype.disconnect = function () {
        if (this.udp) {
            this.udp.close();
            delete this.udp;
        }
    };
    SCAPI.prototype.call = function (requestId, oscpath, args, ok, err) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var clientId = 0, // no longer needed
            clumps;
            requestId = lodash_1.default.isUndefined(requestId) ? cuid_1.default() : requestId;
            args = args ? args : [];
            if (!lodash_1.default.isString(oscpath)) {
                _this.log.err("Bad oscpath" + oscpath);
                throw "Bad oscpath" + oscpath;
            }
            var sender = function (rid, oscArgs) {
                var buf = osc_min_1.default.toBuffer({
                    address: "/API/call",
                    args: [clientId, rid, oscpath].concat(oscArgs),
                });
                _this.udp.send(buf, 0, buf.length, _this.scport, _this.schost, function (err2) {
                    // this will get DNS errors
                    // but not packet-too-big errors
                    if (err2) {
                        _this.log.err(err2);
                    }
                });
            };
            _this.requests[requestId] = { resolve: resolve, reject: reject };
            var isNotOsc = function (a) {
                // if any arg is an object or array
                // or a large string then pass the args as JSON
                // in multiple calls
                if (typeof a === "string") {
                    return a.length > 7168;
                }
                return lodash_1.default.isObject(a) || lodash_1.default.isArray(a);
            };
            if (lodash_1.default.some(args, isNotOsc)) {
                clumps = JSON.stringify(args).match(/.{1,7168}/g);
                lodash_1.default.each(clumps, function (clump, i) {
                    var rid = "" + (i + 1) + "," + clumps.length + ":" + requestId;
                    sender(rid, [clump]);
                });
            }
            else {
                sender(requestId, args);
            }
        });
        if (ok) {
            return promise.then(ok, err);
        }
        else {
            return promise;
        }
    };
    SCAPI.prototype.receive = function (signal, msg) {
        var // clientId = msg.args[0].value,
        requestId = msg.args[1].value, result = msg.args[2].value, request = this.requests[requestId];
        if (!request) {
            this.emit("error", "Unknown request " + requestId);
            this.log.err("Unknown request " + requestId);
            return;
        }
        // reply or scapi_error
        if (signal === "reply") {
            try {
                result = JSON.parse(result);
                result = result.result;
            }
            catch (e) {
                result = "MALFORMED JSON RESPONSE:" + result;
                this.log.err(result);
                signal = "scapi_error";
            }
        }
        var response = {
            signal: signal,
            request_id: requestId,
            result: result,
        };
        if (signal === "reply") {
            request.resolve(response);
        }
        else {
            request.reject(new Errors_1.SCError("API Error response", response));
        }
        delete this.requests[requestId];
    };
    return SCAPI;
}(events_1.default.EventEmitter));
exports.default = SCAPI;
//# sourceMappingURL=scapi.js.map