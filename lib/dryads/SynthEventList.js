"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var dryadic_1 = require("dryadic");
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var msg_1 = require("../server/osc/msg");
var Group_1 = tslib_1.__importDefault(require("./Group"));
var iterators_1 = require("./utils/iterators");
/**
 * Takes a list of synth event objects with relative times and schedules them.
 *
 * ## properties
 *
 * __events:__ Array
 *
 * The event values should be simple JavaScript objects:
 *
 *     {
 *       defName: 'synthDefName',
 *       args: {
 *         out: 0,
 *         freq: 440
 *       },
 *       time: 0.3
 *     }
 *
 *  Where time is seconds relative to the epoch. The epoch is the start time of
 *  the dryadic tree, unless a parent Dryad has set a new epoch into context.
 *
 *    epoch: number|Date|undefined
 *      Optional epoch that the event times in the list are relative to.
 *      Can also be updated by the updateStream
 *      default: context.epoch or now
 *
 * __updateStream:__ Bacon stream to push updated event lists of the form:
 *
 *      {
 *        events: [{time: msgs: []}...],
 *        epoch: 123456789
 *      }

 *     .events Array
 *     .epoch  number|Date
 *
 * Deprecated: will be replaced with live updating and setting of
 * Any value in a dryadic document from the player or remote client.
 *
 * Pushing a new event list cancels previous events and schedules new events.
 *
 * Note that by default the epoch will be unchanged: relative times
 * are still relative to when the Dryad tree started playing or when any parent
 * Dryad set an epoch in context. This means you update the currently playing score
 * but it doesn't restart from the beginning, it keeps playing.
 *
 * Optionally you may push an .epoch with the updateStream. This can be a date or timestamp
 * slightly in the future. If you pass "now" then any events at `0.0` will be too late to play.
 *
 * __defaultParams:__ a fixed object into which the event value is merged.
 *
 * __loopTime:__ Play the events continuously in a loop.
 */
var SynthEventList = /** @class */ (function (_super) {
    tslib_1.__extends(SynthEventList, _super);
    function SynthEventList() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SynthEventList.prototype.defaultProperties = function () {
        return { events: [] };
    };
    SynthEventList.prototype.add = function (player) {
        var _this = this;
        var commands = {
            scserver: {
                schedLoop: function (context, properties) {
                    // temporary: we need to know the play time of the whole document
                    var epoch = context.epoch || lodash_1.default.now() + 200;
                    if (epoch !== context.epoch) {
                        context = player.updateContext(context, { epoch: epoch });
                    }
                    // epoch, was 3rd arg
                    return _this._makeSchedLoop(properties.events || [], properties.loopTime, context);
                },
            },
        };
        // built-in stream support will be added to Dryadic
        // for now it is hard to detect Bacon.Bus as being an object,
        if (this.properties.updateStream) {
            commands = lodash_1.default.assign(commands, {
                run: function (context, properties) {
                    var subscription = properties.updateStream.subscribe(function (streamEvent) {
                        var ee = streamEvent.value();
                        var loopTime = lodash_1.default.isUndefined(ee.loopTime) ? properties.loopTime : ee.loopTime;
                        var epoch = ee.epoch || context.epoch || lodash_1.default.now() + 200;
                        if (epoch !== context.epoch) {
                            context = player.updateContext(context, {
                                epoch: epoch,
                            });
                        }
                        player.callCommand(context.id, {
                            scserver: {
                                // need to set epoch as well because OSCSched uses that for relative times
                                schedLoop: function (ctx /*, props*/) { return _this._makeSchedLoop(ee.events || [], loopTime, ctx); },
                            },
                        });
                    });
                    player.updateContext(context, { subscription: subscription });
                },
            });
        }
        return commands;
    };
    SynthEventList.prototype._makeSchedLoop = function (events, loopTime, context) {
        var synthEvents = this._makeMsgs(events, context);
        return loopTime ? iterators_1.loopedEventListIterator(synthEvents, loopTime) : iterators_1.eventListIterator(synthEvents);
    };
    SynthEventList.prototype._makeMsgs = function (events, context) {
        var defaultParams = this.properties.defaultParams || {};
        return events.map(function (event) {
            // TODO: do this a jit time in the schedLoop
            var defName = event.defName || defaultParams.defName;
            var args = lodash_1.default.assign({ out: context.out || 0 }, defaultParams.args, event.args);
            var msg = msg_1.synthNew(defName, -1, msg_1.AddActions.TAIL, context.group, args);
            return {
                time: event.time,
                msgs: [msg],
            };
        });
    };
    /**
     * @return {object}  command object
     */
    SynthEventList.prototype.remove = function () {
        var _this = this;
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
            scserver: {
                sched: function (context) {
                    // unschedAll
                    return _this._makeSchedLoop([], undefined, context);
                },
            },
        };
    };
    /**
     * @return {Dryad}  Wraps itself in a Group so all child Synth events will be removed on removal of the Group.
     */
    SynthEventList.prototype.subgraph = function () {
        // Dryad needs to typed properly
        return new Group_1.default({}, [this]);
    };
    return SynthEventList;
}(dryadic_1.Dryad));
exports.default = SynthEventList;
//# sourceMappingURL=SynthEventList.js.map