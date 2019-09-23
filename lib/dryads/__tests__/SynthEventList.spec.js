"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var baconjs_1 = tslib_1.__importDefault(require("baconjs"));
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var SynthEventList_1 = tslib_1.__importDefault(require("../SynthEventList"));
describe("SynthEventList", function () {
    var events = [{ defName: "blip", args: { freq: 440 }, time: 1.0 }];
    var context = {
        group: 0,
        out: 0,
        epoch: 1460987712857,
        id: "id",
    };
    // bad to mock this, it's fragile
    var player = {
        updateContext: function (ctx, update) { return lodash_1.default.assign({}, ctx, update); },
        callCommand: function ( /*id, command*/) { },
    };
    describe("_makeMsgs", function () {
        // context group epoch
        var sel = new SynthEventList_1.default();
        var scheded = sel._makeMsgs(events, context);
        var first = scheded[0];
        it("should have events in the packet", function () {
            expect(scheded.length).toEqual(1);
        });
        it("should have a msgs array", function () {
            expect(lodash_1.default.isArray(first.msgs)).toBe(true);
            expect(lodash_1.default.isArray(first.msgs[0])).toBe(true);
        });
    });
    describe("spawn events in supplied list on .add", function () {
        var props = { events: events };
        var sel = new SynthEventList_1.default(props);
        var commands = sel.add(player);
        it("should contain a function", function () {
            expect(typeof commands.scserver.schedLoop).toBe("function");
        });
        it("should schedule 1 event", function () {
            var fn = commands.scserver.schedLoop(context, props);
            var e = fn(0);
            expect(e.event.time).toEqual(1);
        });
    });
    describe("pass in updateStream", function () {
        var bus, sel, dp, updated, called, properties;
        beforeEach(function () {
            bus = new baconjs_1.default.Bus();
            properties = { updateStream: bus };
            sel = new SynthEventList_1.default(properties);
            dp = {
                updateContext: function (ctx, update) {
                    updated = update;
                },
                callCommand: function (id, command) {
                    called = command;
                },
            };
        });
        it("should subscribe to stream on .add", function () {
            spyOn(player, "updateContext");
            var commands = sel.add(dp);
            if (commands.run) {
                commands.run(context, properties);
                expect(updated).toBeTruthy(); // {subscription: bacon subscription}
            }
            else {
                throw new Error("command does not have 'run' defined");
            }
        });
        it("should get a new event when pushed to bus", function () {
            spyOn(player, "callCommand");
            var commands = sel.add(dp);
            if (commands.run) {
                commands.run(context, properties);
                bus.push({
                    events: [{ defName: "nuevo-blip", args: { freq: 441 }, time: 2.0 }],
                });
                expect(called).toBeDefined();
                expect(called.scserver).toBeTruthy(); // scserver command
            }
            else {
                throw new Error("command does not have 'run' defined");
            }
        });
    });
});
//# sourceMappingURL=SynthEventList.spec.js.map