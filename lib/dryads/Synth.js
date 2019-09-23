"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var dryadic_1 = require("dryadic");
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var node_watcher_1 = require("../server/node-watcher");
var msg_1 = require("../server/osc/msg");
/**
 * Creates a synth on the server.
 *
 * Properties:
 * - def
 * - args
 */
var Synth = /** @class */ (function (_super) {
    tslib_1.__extends(Synth, _super);
    function Synth() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * If there is no SCServer in the parent context,
     * then this will wrap itself in an SCServer
     */
    Synth.prototype.requireParent = function () {
        return "SCServer";
    };
    Synth.prototype.prepareForAdd = function () {
        return {
            updateContext: function (context) { return ({
                nodeID: context.scserver.state.nextNodeID(),
            }); },
        };
    };
    // synthDefName(context:object) : string {
    //   // The parent SCSynthDef publishes both .synthDef (object) and .synthDefName to context
    //   let name = _.isString(this.properties.def) ? this.properties.def : (context.synthDef && context.synthDef.name);
    //   if (!name) {
    //     throw new Error('No synthDefName supplied to Synth', context);
    //   }
    //   return name;
    // }
    Synth.prototype.add = function () {
        var _this = this;
        var defName = function (def) { return (typeof def === "string" ? def : def.name); };
        return {
            scserver: {
                msg: function (context, properties) {
                    var args = lodash_1.default.mapValues(properties.args, function (value, key) { return _this._checkOscType(value, key, context.id); });
                    // if out is not set in args and out is in synthdef
                    // then set it from context
                    // TODO: check that synthDef has an arg named out
                    if (lodash_1.default.isUndefined(args.out) && !lodash_1.default.isUndefined(context.out)) {
                        args.out = context.out;
                    }
                    var dn = _this._checkOscType(defName(properties.def), "def.name", context.id);
                    return msg_1.synthNew(dn, context.nodeID, msg_1.AddActions.TAIL, context.group, args);
                },
            },
            run: function (context, properties) {
                return node_watcher_1.whenNodeGo(context.scserver, context.id, context.nodeID || -1).then(function (nodeID) {
                    // TODO: call a method instead so its testable
                    node_watcher_1.updateNodeState(context.scserver, nodeID, {
                        synthDef: defName(properties.def),
                    });
                    return nodeID;
                });
            },
        };
    };
    Synth.prototype.remove = function () {
        return {
            scserver: {
                msg: function (context) { return msg_1.nodeFree(context.nodeID || -1); },
            },
            run: function (context) { return node_watcher_1.whenNodeEnd(context.scserver, context.id, context.nodeID || -1); },
        };
    };
    Synth.prototype._checkOscType = function (v, key, id) {
        switch (typeof v) {
            case "number":
            case "string":
                // case 'Buffer':
                return v;
            default:
                throw new Error("Invalid OSC type for Synth " + key + ": [" + typeof v + ": " + v + "] @ " + id);
        }
    };
    return Synth;
}(dryadic_1.Dryad));
exports.default = Synth;
//# sourceMappingURL=Synth.js.map