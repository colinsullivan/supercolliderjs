"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var dryadic_1 = require("dryadic");
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var msg_1 = require("../server/osc/msg");
/**
 * Sends nodeSet messages to the Synth in the parent context.
 *
 * This takes a Bacon.js stream which should return objects
 * {param: value, ...} and sends `nodeSet` messages to the parent Synth.
 *
 * SynthControl should be a child of a Synth, Group or other Dryad that
 * sets context.nodeID
 */
var SynthControl = /** @class */ (function (_super) {
    tslib_1.__extends(SynthControl, _super);
    function SynthControl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * If there is no SCServer in the parent context,
     * then this will wrap itself in an SCServer
     */
    SynthControl.prototype.requireParent = function () {
        return "SCServer";
    };
    SynthControl.prototype.add = function (player) {
        return {
            run: function (context, properties) {
                if (properties.stream) {
                    var subscription = properties.stream.subscribe(function (event) {
                        // This assumes a Bacon event.
                        // Should validate that event.value is object
                        var msg = msg_1.nodeSet(context.nodeID || -1, event.value());
                        player.callCommand(context.id, {
                            scserver: {
                                bundle: {
                                    time: 0.03,
                                    packets: [msg],
                                },
                            },
                        });
                    });
                    player.updateContext(context, { subscription: subscription });
                }
            },
        };
    };
    SynthControl.prototype.remove = function () {
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
    return SynthControl;
}(dryadic_1.Dryad));
exports.default = SynthControl;
//# sourceMappingURL=SynthControl.js.map