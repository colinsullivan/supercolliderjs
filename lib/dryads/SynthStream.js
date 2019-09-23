"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var dryadic_1 = require("dryadic");
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var msg_1 = require("../server/osc/msg");
var Group_1 = tslib_1.__importDefault(require("./Group"));
var LATENCY = 0.03;
/**
 * Given a Bacon.js stream that returns objects, this spawns a series of Synths.
 *
 * Properties:
 *  {Bacon.EventStream} stream
 *  {object} defaultParams
 *
 * The event values should be simple JavaScript objects:
 *
 * {
 *   defName: 'synthDefName',
 *   args: {
 *     out: 0,
 *     freq: 440
 *   }
 * }
 *
 * defaultParams is a fixed object into which the event value is merged.
 */
var SynthStream = /** @class */ (function (_super) {
    tslib_1.__extends(SynthStream, _super);
    function SynthStream() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SynthStream.prototype.add = function (player) {
        var _this = this;
        return {
            run: function (context, properties) {
                var subscription = properties.stream.subscribe(function (event) {
                    // This assumes a Bacon event.
                    // Should validate that event.value is object
                    // assumes context has not been updated and is the same event
                    // use player.getContext()
                    _this.handleEvent(event.value(), context, properties, player);
                });
                player.updateContext(context, { subscription: subscription });
            },
        };
    };
    SynthStream.prototype.commandsForEvent = function (event, context, properties) {
        var _a;
        var msgs = [];
        var updateContext;
        var nodeIDs = context.nodeIDs || {};
        var key = event.key ? String(event.key) : "undefined";
        switch (event.type) {
            case "noteOff": {
                // if no key then there is no way to shut off notes
                // other than sending to the group
                var nodeID = nodeIDs[key];
                if (nodeID) {
                    msgs.push(msg_1.nodeFree(nodeID || -1));
                    // TODO: if synthDef hasGate else just free it
                    // msgs.push(nodeSet(nodeID, [event.gate || 'gate', 0]));
                    // remove from nodeIDs
                    updateContext = {
                        nodeIDs: lodash_1.default.omit(nodeIDs, [key]),
                    };
                }
                else {
                    throw new Error("NodeID was not registered for event key " + (key || "undefined"));
                }
                break;
            }
            default: {
                // noteOn
                var defaultParams = properties.defaultParams || {};
                var args = lodash_1.default.assign({ out: context.out || 0 }, defaultParams.args, event.args);
                var defName = event.defName || defaultParams.defName;
                // if ev.id then create a nodeID and store it
                // otherwise it is anonymous
                var nodeID = -1;
                if (key) {
                    nodeID = context.scserver.state.nextNodeID();
                    // store the nodeID
                    updateContext = {
                        nodeIDs: lodash_1.default.assign({}, nodeIDs, (_a = {},
                            _a[key] = nodeID,
                            _a)),
                    };
                }
                var synth = msg_1.synthNew(defName, nodeID, msg_1.AddActions.TAIL, context.group, args);
                msgs.push(synth);
            }
        }
        return {
            scserver: {
                bundle: {
                    time: LATENCY,
                    packets: msgs,
                },
            },
            updateContext: updateContext,
        };
    };
    SynthStream.prototype.handleEvent = function (event, context, properties, player) {
        player.callCommand(context.id, this.commandsForEvent(event, context, properties));
    };
    SynthStream.prototype.remove = function () {
        return {
            run: function (context) {
                if (context.subscription) {
                    if (lodash_1.default.isFunction(context.subscription)) {
                        // baconjs style
                        context.subscription();
                    }
                    else {
                        // Rx style
                        context.subscription.dispose();
                    }
                }
            },
        };
    };
    SynthStream.prototype.subgraph = function () {
        return new Group_1.default({}, [this]);
    };
    return SynthStream;
}(dryadic_1.Dryad));
exports.default = SynthStream;
//# sourceMappingURL=SynthStream.js.map